const express=require('express');
const fs=require('fs');
const path=require('path');
const app=express();

app.disable('x-powered-by');
app.use(express.json({limit:'2mb'}));
app.use((err,req,res,next)=>{if(err?.type==='entity.too.large')return res.status(413).json({error:'Configuration upload is too large'});if(err?.type==='entity.parse.failed'||err instanceof SyntaxError&&err?.status===400)return res.status(400).json({error:'Invalid JSON request body'});next(err)});
app.use('/api',(req,res,next)=>{res.setHeader('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');res.setHeader('Pragma','no-cache');res.setHeader('Expires','0');next()});

const DB=path.join(__dirname,'incidents.json');
const PUBLIC_DB=path.join(__dirname,'public_incidents.json');
const CONFIG=path.join(__dirname,'config.json');
const AUDIT=path.join(__dirname,'audit.json');
const SEQUENCES=path.join(__dirname,'id_sequences.json');

function readJson(file,fallback){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return fallback}}
function writeJson(file,value){const temp=`${file}.tmp`;fs.writeFileSync(temp,JSON.stringify(value,null,2),'utf8');try{fs.renameSync(temp,file)}catch{fs.copyFileSync(temp,file);fs.unlinkSync(temp)}}
function ensureFile(file,fallback){if(!fs.existsSync(file))writeJson(file,fallback)}

ensureFile(DB,[]);
ensureFile(PUBLIC_DB,[]);
ensureFile(CONFIG,{version:1,system:{orgName:'MBI Signal Operations',appName:'MBI Broadcast Signal Logger',adminName:'Administrator'}});
ensureFile(AUDIT,[]);
ensureFile(SEQUENCES,{INC:0,PUB:0});

const readIncidents=()=>readJson(DB,[]);
const readPublicIncidents=()=>readJson(PUBLIC_DB,[]);
const readConfig=()=>readJson(CONFIG,{});
const readAudit=()=>readJson(AUDIT,[]);
const readSequences=()=>readJson(SEQUENCES,{INC:0,PUB:0});
const text=value=>typeof value==='string'?value.trim():'';
function finite(value,min,max){if(value===null||value===undefined||value==='')return null;const n=Number(value);return Number.isFinite(n)&&n>=min&&n<=max?n:null}
function jsonFileHealth(file,validate){try{return {ok:!!validate(JSON.parse(fs.readFileSync(file,'utf8')))}}catch{return {ok:false}}}

function healthSnapshot(){
  const checks={incidents:jsonFileHealth(DB,Array.isArray),publicIncidents:jsonFileHealth(PUBLIC_DB,Array.isArray),config:jsonFileHealth(CONFIG,v=>v&&typeof v==='object'&&!Array.isArray(v)),audit:jsonFileHealth(AUDIT,Array.isArray),idSequences:jsonFileHealth(SEQUENCES,v=>v&&typeof v==='object'&&!Array.isArray(v)&&Number.isFinite(Number(v.INC??0))&&Number.isFinite(Number(v.PUB??0)))};
  const centralStorage=Object.values(checks).every(c=>c.ok);
  return {ok:centralStorage,version:'6.5.13-terrestrial-car-radius',schemaVersion:9,centralStorage,checks,features:{separatePublicStorage:true,combinedAnalysis:true,publicObservationScoring:true,fieldObservationScoring:true,serverGeneratedIncidentIds:true,continuousIncidentSequences:true,persistedIncidentSequenceState:true,publicAppAdminConfiguration:true,sharedBranding:true,unifiedDesignSystem:true,contextualPublicPalette:true,configBackedColorSystem:true,configurableChoiceSets:true,rememberedReportContext:true,singleDockingPublicSubmit:true,highContrastReportSummary:true,graphicalPublicProgress:true,zebraIncidentHistory:true,publicWelcomeWindow:true,sessionWelcomeDismissal:true,delayedPublicGps:true,sharedDarkMode:true,configurableDashboards:true,fieldCombinedHistory:true,fieldPublicReadOnly:true,accessibleToasts:true,responsiveNavigation:true,stationCoverageReference:true,distanceCalculation:true,realtimeRfReference:true,rfEstimationMetadata:true,nominalEirpDerivation:true,idealCarReceptionRadius:true,calibratedRfModel:false},checkedAt:new Date().toISOString()}
}

function stationRecord(value,index=0){
  if(typeof value==='string')return {id:value,name:value,latitude:null,longitude:null,rfPower:null,rfPowerUnit:null,towerHeightFt:null,antennaGainDb:null,frequencyMHz:null,idealCarSensitivityDbm:null,enabled:true,_legacy:true};
  if(!value||typeof value!=='object')return null;
  const name=text(value.name||value.stationName||value.label),id=text(value.id||value.stationId)||name||`ST-${String(index+1).padStart(3,'0')}`;
  if(!name)return null;
  const powerUnit=text(value.rfPowerUnit||value.powerUnit).toUpperCase();
  return {...value,id,name,latitude:finite(value.latitude??value.lat,-90,90),longitude:finite(value.longitude??value.lon??value.lng,-180,180),rfPower:finite(value.rfPower??value.transmitterPower,Number.MIN_VALUE,Number.MAX_VALUE),rfPowerUnit:['KW','W'].includes(powerUnit)?(powerUnit==='KW'?'kW':'W'):null,towerHeightFt:finite(value.towerHeightFt??value.towerHeight,Number.MIN_VALUE,Number.MAX_VALUE),antennaGainDb:finite(value.antennaGainDb??value.antennaGain,-Number.MAX_VALUE,Number.MAX_VALUE),frequencyMHz:finite(value.frequencyMHz??value.frequency,Number.MIN_VALUE,Number.MAX_VALUE),idealCarSensitivityDbm:finite(value.idealCarSensitivityDbm??value.receiverSensitivityDbm,-Number.MAX_VALUE,Number.MAX_VALUE),enabled:value.enabled!==false}
}

const stationsFromConfig=cfg=>(Array.isArray(cfg?.stations)?cfg.stations:[]).map(stationRecord).filter(Boolean);
function findStation(cfg,report){const id=text(report.siteId),name=text(report.siteName||report.station);return stationsFromConfig(cfg).find(s=>s.id===id||s.name===id||s.id===name||s.name===name)||null}
function haversineKm(lat1,lon1,lat2,lon2){const rad=d=>d*Math.PI/180,dLat=rad(lat2-lat1),dLon=rad(lon2-lon1),a=Math.sin(dLat/2)**2+Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;return 6371.0088*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))}
function distanceFromStation(station,report){const lat=finite(report.lat??report.latitude,-90,90),lon=finite(report.lon??report.lng??report.longitude,-180,180);if(!station||station.latitude===null||station.longitude===null||lat===null||lon===null)return null;return Number(haversineKm(station.latitude,station.longitude,lat,lon).toFixed(3))}

function deriveNominalEirp(station){
  if(!station||station.rfPower===null||!station.rfPowerUnit||station.antennaGainDb===null)return null;
  const transmitterPowerW=station.rfPowerUnit==='kW'?station.rfPower*1000:station.rfPower,gainLinear=10**(station.antennaGainDb/10),eirpW=transmitterPowerW*gainLinear,eirpDbw=10*Math.log10(transmitterPowerW)+station.antennaGainDb;
  if(!Number.isFinite(transmitterPowerW)||!Number.isFinite(eirpW)||!Number.isFinite(eirpDbw))return null;
  return {status:'derived-nominal',transmitterPowerW:Number(transmitterPowerW.toFixed(6)),antennaGainDb:station.antennaGainDb,feedlineLossDb:null,eirpW:Number(eirpW.toFixed(6)),eirpKw:Number((eirpW/1000).toFixed(6)),eirpDbw:Number(eirpDbw.toFixed(3)),eirpDbm:Number((eirpDbw+30).toFixed(3)),formula:'EIRP(dBW) = 10*log10(transmitterPowerW) + antennaGainDb',assumption:'Transmitter power is treated as antenna-input power; no feeder/system loss was provided or invented.'}
}

function deriveIdealCarReception(station){
  const eirp=deriveNominalEirp(station),frequencyMHz=station?.frequencyMHz,sensitivityDbm=station?.idealCarSensitivityDbm,towerHeightFt=station?.towerHeightFt;
  if(!eirp||frequencyMHz===null||sensitivityDbm===null||towerHeightFt===null)return null;

  // Receiver sensitivity remains useful, but only as a link-budget ceiling.
  const receiverAntennaGainDbi=0;
  const maxPathLossDb=eirp.eirpDbm+receiverAntennaGainDbi-sensitivityDbm;
  const freeSpaceSensitivityDistanceKm=10**((maxPathLossDb-32.44-20*Math.log10(frequencyMHz))/20);

  // A terrestrial VHF service cannot use the free-space ceiling as an unlimited
  // ground-coverage radius. Limit the analytical reference by the radio horizon.
  // Standard refraction assumption: effective Earth-radius factor k = 4/3.
  const receiverHeightM=1.5,effectiveEarthRadiusFactor=4/3,towerHeightM=towerHeightFt*0.3048;
  const radioHorizonDistanceKm=3.57*Math.sqrt(effectiveEarthRadiusFactor)*(Math.sqrt(Math.max(0,towerHeightM))+Math.sqrt(receiverHeightM));

  if(!Number.isFinite(freeSpaceSensitivityDistanceKm)||freeSpaceSensitivityDistanceKm<=0||!Number.isFinite(radioHorizonDistanceKm)||radioHorizonDistanceKm<=0)return null;

  const distanceKm=Math.min(freeSpaceSensitivityDistanceKm,radioHorizonDistanceKm);
  const limitingFactor=radioHorizonDistanceKm<=freeSpaceSensitivityDistanceKm?'radio-horizon':'receiver-sensitivity';

  return {
    status:'ideal-terrestrial-reference',
    modelVersion:'terrestrial-horizon-limited-v2',
    frequencyMHz,
    sensitivityDbm,
    receiverAntennaGainDbi,
    receiverHeightM,
    effectiveEarthRadiusFactor,
    towerHeightM:Number(towerHeightM.toFixed(3)),
    otherLossesDb:null,
    maxPathLossDb:Number(maxPathLossDb.toFixed(3)),
    freeSpaceSensitivityDistanceKm:Number(freeSpaceSensitivityDistanceKm.toFixed(3)),
    radioHorizonDistanceKm:Number(radioHorizonDistanceKm.toFixed(3)),
    distanceKm:Number(distanceKm.toFixed(3)),
    limitingFactor,
    formula:'idealRadiusKm = min(freeSpaceSensitivityDistanceKm, 3.57*sqrt(4/3)*(sqrt(towerHeightM)+sqrt(receiverHeightM)))',
    assumption:'Ideal terrestrial FM reference. Receiver sensitivity is retained as a free-space upper bound, while the reported radius is limited by the standard 4/3-Earth radio horizon using configured tower height and a 1.5 m car antenna. Terrain, buildings, foliage, interference, diffraction, directional antenna pattern, feeder/system loss, fading, and measured field-strength calibration are not modeled.',
    notGuaranteedCoverage:true
  }
}

function buildRfEstimate(station,report){
  const horizontalDistanceKm=distanceFromStation(station,report),nominalEirp=deriveNominalEirp(station),idealCarReception=deriveIdealCarReception(station);
  const inputs=station?{rfPower:station.rfPower,rfPowerUnit:station.rfPowerUnit,towerHeightFt:station.towerHeightFt,antennaGainDb:station.antennaGainDb,frequencyMHz:station.frequencyMHz,idealCarSensitivityDbm:station.idealCarSensitivityDbm,distanceFromStationKm:horizontalDistanceKm}:null;
  if(!station||horizontalDistanceKm===null||!nominalEirp||station.towerHeightFt===null)return {status:'insufficient-reference-data',calibratedModel:false,estimatedSignalStrength:null,method:'ITU-R P.525 free-space reference',modelVersion:'free-space-reference-v1',confidence:'reference-only',inputs,nominalEirp,idealCarReception,note:'Station coordinates, tower height, RF power, antenna gain, and live report GPS are required.'};
  const towerHeightKm=station.towerHeightFt*0.3048/1000,referenceDistanceKm=Math.max(.001,Math.sqrt(horizontalDistanceKm**2+towerHeightKm**2)),distanceM=referenceDistanceKm*1000,fieldStrengthVoltsPerMeter=Math.sqrt(30*nominalEirp.eirpW)/distanceM,dbuvm=20*Math.log10(fieldStrengthVoltsPerMeter)+120;
  if(!Number.isFinite(dbuvm))return {status:'calculation-unavailable',calibratedModel:false,estimatedSignalStrength:null,method:'ITU-R P.525 free-space reference',modelVersion:'free-space-reference-v1',confidence:'reference-only',inputs,nominalEirp,idealCarReception};
  return {status:'calculated-reference',calibratedModel:false,estimatedSignalStrength:{value:Number(dbuvm.toFixed(1)),unit:'dBµV/m',source:'estimated',method:'ITU-R P.525 free-space reference',modelVersion:'free-space-reference-v1',calibrated:false},method:'ITU-R P.525 free-space reference',modelVersion:'free-space-reference-v1',confidence:'reference-only',horizontalDistanceKm,referenceDistanceKm:Number(referenceDistanceKm.toFixed(3)),towerHeightKm:Number(towerHeightKm.toFixed(3)),inputs:{...inputs,referenceDistanceKm:Number(referenceDistanceKm.toFixed(3))},nominalEirp,idealCarReception,note:'Free-space reference only; terrain, clutter, interference, fading, feeder loss, and receiver characteristics are not modeled.'}
}

const stationRequired=s=>!!(s&&s.name&&s.latitude!==null&&s.longitude!==null&&s.rfPower!==null&&s.rfPowerUnit&&s.towerHeightFt!==null&&s.antennaGainDb!==null&&s.frequencyMHz!==null&&s.idealCarSensitivityDbm!==null);
function sameStationReference(a,b){if(!a||!b)return false;return ['id','name','latitude','longitude','rfPower','rfPowerUnit','towerHeightFt','antennaGainDb','frequencyMHz','idealCarSensitivityDbm','enabled'].every(key=>a[key]===b[key])}
function validateStations(config,current={}){
  if(!Array.isArray(config.stations))return null;
  const previous=stationsFromConfig(current),claimed=new Set(),ids=new Set(),names=new Set();
  for(let i=0;i<config.stations.length;i++){
    const raw=config.stations[i],s=stationRecord(raw,i);
    if(!s)return `Station ${i+1} requires a name`;
    if(ids.has(s.id.toLowerCase()))return `Duplicate station ID: ${s.id}`;
    if(names.has(s.name.toLowerCase()))return `Duplicate station name: ${s.name}`;
    ids.add(s.id.toLowerCase());names.add(s.name.toLowerCase());
    if(typeof raw==='object'&&raw){if(raw.latitude!==''&&raw.latitude!=null&&s.latitude===null)return `Invalid latitude for ${s.name}`;if(raw.longitude!==''&&raw.longitude!=null&&s.longitude===null)return `Invalid longitude for ${s.name}`;if(raw.rfPower!==''&&raw.rfPower!=null&&s.rfPower===null)return `RF transmitter power for ${s.name} must be greater than zero`;if(raw.rfPowerUnit!==''&&raw.rfPowerUnit!=null&&s.rfPowerUnit===null)return `RF power unit for ${s.name} must be kW or W`;if(raw.towerHeightFt!==''&&raw.towerHeightFt!=null&&s.towerHeightFt===null)return `Tower height for ${s.name} must be greater than zero`;if(raw.antennaGainDb!==''&&raw.antennaGainDb!=null&&s.antennaGainDb===null)return `Antenna gain for ${s.name} must be a finite dB value`;if(raw.frequencyMHz!==''&&raw.frequencyMHz!=null&&s.frequencyMHz===null)return `Frequency for ${s.name} must be greater than zero MHz`;if(raw.idealCarSensitivityDbm!==''&&raw.idealCarSensitivityDbm!=null&&s.idealCarSensitivityDbm===null)return `Ideal car sensitivity for ${s.name} must be a finite dBm value`}
    const oldIndex=previous.findIndex((p,j)=>!claimed.has(j)&&(p.id===s.id||p.name===s.name)),unchangedLegacy=oldIndex>=0&&sameStationReference(s,previous[oldIndex]);
    if(oldIndex>=0)claimed.add(oldIndex);
    if(!unchangedLegacy&&!stationRequired(s))return `Station ${s.name} requires latitude, longitude, RF power with kW/W unit, tower height in feet, antenna gain in dB, frequency in MHz, and ideal car sensitivity in dBm`;
  }
  return null
}

const SCORE_MAPS={quality:{excellent:[5,5],good:[4,5],fair:[3,5],poor:[2,5],'no signal':[0,5]},stability:{stable:[4,4],fluctuating:[3,4],intermittent:[2,4],interference:[2,4],unstable:[1,4]},service:{normal:[5,5],interference:[3,5],distortion:[3,5],'audio dropout':[2,5],'weak reception':[2,5],'no service / no signal':[0,5],'no service':[0,5]}};
function configuredScore(kind,label,cfg,appKey='public'){const ui=cfg?.ui&&typeof cfg.ui==='object'?cfg.ui:cfg,list=ui?.choiceSets?.[appKey]?.[kind],clean=text(label).toLowerCase(),maxScore={quality:5,stability:4,service:5}[kind];if(!Array.isArray(list)||!clean)return null;const choice=list.find(item=>item?.enabled!==false&&text(item?.label).toLowerCase()===clean),score=Number(choice?.score);return choice&&Number.isFinite(score)&&score>=0&&score<=maxScore?[score,maxScore]:null}
function scoredObservation(kind,label,cfg,appKey){const clean=text(label),pair=configuredScore(kind,clean,cfg,appKey)||SCORE_MAPS[kind]?.[clean.toLowerCase()];return !clean?null:pair?{label:clean,score:pair[0],maxScore:pair[1],index0to100:Number((pair[0]/pair[1]*100).toFixed(1))}:{label:clean,score:null,maxScore:null,index0to100:null}}
function observationAnalysis(report,cfg=readConfig(),appKey=(report?.reportType==='volunteer'?'public':'field')){
  const quality=scoredObservation('quality',report.quality,cfg,appKey),stability=scoredObservation('stability',report.stability,cfg,appKey),service=scoredObservation('service',report.service,cfg,appKey),indexes=[quality,stability,service].map(x=>x?.index0to100).filter(Number.isFinite),labels=[report.quality,report.stability,report.service].map(x=>text(x).toLowerCase());
  return {modelVersion:'observation-index-v3-app-configurable',choiceSet:appKey,scaleType:'ordinal-observation-analysis',quality,stability,service,receptionExperienceIndex0to100:indexes.length?Number((indexes.reduce((a,b)=>a+b,0)/indexes.length).toFixed(1)):null,flags:{noSignal:labels.some(x=>x.includes('no signal')||x==='no service'),interference:labels.includes('interference'),distortion:labels.includes('distortion'),audioDropout:labels.includes('audio dropout'),weakReception:labels.includes('weak reception'),unstable:labels.includes('unstable'),intermittent:labels.includes('intermittent')}}
}

function incidentSequenceRows(reportType){return reportType==='volunteer'?readPublicIncidents():readIncidents()}
function sequenceFromRow(row,prefix){const explicit=Number(row?.idSequence);if(Number.isSafeInteger(explicit)&&explicit>0)return explicit;const id=text(row?.id);if(!id.startsWith(prefix)||!new RegExp(`^${prefix}\\d{15,}$`).test(id))return 0;const parsed=Number(id.slice(prefix.length+14));return Number.isSafeInteger(parsed)&&parsed>0?parsed:0}
function observedSequenceMax(reportType,prefix){return incidentSequenceRows(reportType).reduce((max,row)=>Math.max(max,sequenceFromRow(row,prefix)),0)}
function nextIncidentSequence(reportType){const prefix=reportType==='volunteer'?'PUB':'INC',state=readSequences(),saved=Number(state[prefix]);const sequence=Math.max(Number.isSafeInteger(saved)&&saved>0?saved:0,observedSequenceMax(reportType,prefix))+1;writeJson(SEQUENCES,{...state,[prefix]:sequence});return sequence}
function reversedDateToken(date){return `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`.split('').reverse().join('')}
function timeToken(date){return `${String(date.getHours()).padStart(2,'0')}${String(date.getMinutes()).padStart(2,'0')}${String(date.getSeconds()).padStart(2,'0')}`}
function generateIncidentIdentity(reportType,date=new Date()){const prefix=reportType==='volunteer'?'PUB':'INC',sequence=nextIncidentSequence(reportType);return{id:`${prefix}${reversedDateToken(date)}${timeToken(date)}${sequence}`,sequence,scheme:'compact-reversed-full-date-time-continuous-v1'}}
function existingSubmission(key){if(!key)return null;return [...readIncidents(),...readPublicIncidents()].find(row=>text(row?.submissionKey)===key||text(row?.clientIncidentId)===key||text(row?.id)===key)||null}

function publicAppConfig(cfg){return cfg?.publicApp&&typeof cfg.publicApp==='object'?cfg.publicApp:(cfg?.ui?.publicApp&&typeof cfg.ui.publicApp==='object'?cfg.ui.publicApp:{})}
function publicFieldRule(cfg,key,fallbackRequired){const rule=publicAppConfig(cfg)?.fields?.[key];return {visible:rule?.visible!==false,required:rule?.required===undefined?fallbackRequired:!!rule.required}}
function requiredPublicFields(cfg){return [['name','Volunteer / listener name',false],['station','Station',true],['channel','Channel / Frequency',false],['quality','Signal Quality',true],['stability','Signal Stability',true],['service','Service Condition',true],['comments','Comments / Observations',false]].filter(([key,,fallback])=>{const rule=publicFieldRule(cfg,key,fallback);return rule.visible&&rule.required})}

function audit(req,category,what,action='UPDATE',result='SUCCESS',actor){const logs=readAudit(),cfg=readConfig();logs.unshift({id:`AUD-${Date.now()}-${Math.floor(Math.random()*1000)}`,when:new Date().toISOString(),who:actor||cfg.system?.adminName||'Administrator',role:'Administrator',action,category,item:category,what,ip:req.ip||req.socket?.remoteAddress||'',result});writeJson(AUDIT,logs.slice(0,5000))}

function incidentForDashboard(report,cfg,storageSource){
  const station=findStation(cfg,report),stored=finite(report.distanceFromStationKm,0,Number.MAX_VALUE),calculated=stored??distanceFromStation(station,report),freshIdealCarReception=deriveIdealCarReception(station),baseRfEstimation=report.rfEstimation||buildRfEstimate(station,report),rfEstimation=baseRfEstimation?{...baseRfEstimation,idealCarReception:freshIdealCarReception}:baseRfEstimation,lat=finite(report.lat??report.latitude,-90,90),lon=finite(report.lon??report.lng??report.longitude,-180,180);
  return {...report,storageSource:report.storageSource||storageSource,distanceFromStationKm:calculated,stationCoordinateStatus:report.stationCoordinateStatus||(station?'configured':'station-not-configured'),geographicEnrichment:report.geographicEnrichment||{status:calculated===null?'unavailable':'calculated',method:'haversine',earthRadiusKm:6371.0088,distanceFromStationKm:calculated,stationCoordinates:station?{latitude:station.latitude,longitude:station.longitude}:null,reportCoordinates:lat!==null&&lon!==null?{latitude:lat,longitude:lon}:null,source:stored!==null?'stored-distance':'read-time-station-reference'},rfEstimation}
}
const incidentViews=(rows,storageSource)=>{const cfg=readConfig();return rows.map(row=>incidentForDashboard(row,cfg,storageSource))};
const readIncidentViews=()=>incidentViews(readIncidents(),'field');
const readPublicIncidentViews=()=>incidentViews(readPublicIncidents(),'public');
const readCombinedIncidentViews=()=>[...readIncidentViews(),...readPublicIncidentViews()].sort((a,b)=>String(b.datetime||b.serverReceivedAt||'').localeCompare(String(a.datetime||a.serverReceivedAt||'')));

function countBy(rows,key){return rows.reduce((out,row)=>{const value=row[key]||'Unknown';out[value]=(out[value]||0)+1;return out},{})}
function average(values,digits=1){const clean=values.map(Number).filter(Number.isFinite);return clean.length?Number((clean.reduce((a,b)=>a+b,0)/clean.length).toFixed(digits)):null}
function analysisSummary(rows){
  const publicRows=rows.filter(r=>(r.reportType||'engineer')==='volunteer'),fieldRows=rows.filter(r=>(r.reportType||'engineer')!=='volunteer'),distances=rows.map(r=>r.distanceFromStationKm).filter(Number.isFinite),publicIndexes=publicRows.map(r=>r.observationAnalysis?.receptionExperienceIndex0to100).filter(Number.isFinite),strengthValue=r=>finite(r.signalStrength?.value??r.strength,-Number.MAX_VALUE,Number.MAX_VALUE),byStation={};
  for(const row of rows){const key=row.siteName||row.station||'Unknown';byStation[key]??={total:0,field:0,public:0,publicReceptionIndexes:[],publicSignalStrengths:[],fieldSignalStrengths:[]};const item=byStation[key];item.total++;if((row.reportType||'engineer')==='volunteer'){item.public++;const index=row.observationAnalysis?.receptionExperienceIndex0to100,signal=strengthValue(row);if(Number.isFinite(index))item.publicReceptionIndexes.push(index);if(Number.isFinite(signal))item.publicSignalStrengths.push(signal)}else{item.field++;const signal=strengthValue(row);if(Number.isFinite(signal))item.fieldSignalStrengths.push(signal)}}
  for(const item of Object.values(byStation)){item.averagePublicReceptionIndex0to100=average(item.publicReceptionIndexes);item.averagePublicSignalStrengthDbuvm=average(item.publicSignalStrengths);item.averageFieldSignalStrengthDbuvm=average(item.fieldSignalStrengths);delete item.publicReceptionIndexes;delete item.publicSignalStrengths;delete item.fieldSignalStrengths}
  return {total:rows.length,field:fieldRows.length,public:publicRows.length,open:rows.filter(r=>!['Resolved','Closed'].includes(r.status)).length,critical:rows.filter(r=>r.severity==='Critical').length,byStation,byQuality:countBy(rows,'quality'),byStability:countBy(rows,'stability'),byService:countBy(rows,'service'),byReportType:countBy(rows,'reportType'),byMeasurementSource:countBy(rows,'measurementSource'),reportsWithDistance:distances.length,averageDistanceFromStationKm:average(distances,3),averagePublicReceptionIndex0to100:average(publicIndexes),averagePublicSignalStrengthDbuvm:average(publicRows.map(strengthValue)),averageFieldSignalStrengthDbuvm:average(fieldRows.map(strengthValue))}
}

app.get('/api/health',(req,res)=>res.json(healthSnapshot()));
app.get('/api/config',(req,res)=>res.json(readConfig()));
app.put('/api/config',(req,res)=>{
  const incoming=req.body;
  if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))return res.status(400).json({error:'Invalid configuration'});
  const current=readConfig(),stationError=validateStations(incoming,current);if(stationError)return res.status(400).json({error:stationError});
  const next={...incoming},area=String(next._auditArea||'Configuration'),what=String(next._auditWhat||'Updated application configuration');
  delete next._auditArea;delete next._auditWhat;next.version=Number(current.version||0)+1;
  if(Array.isArray(next.stations))next.stations=next.stations.map((raw,index)=>{if(!raw||typeof raw!=='object')return raw;const station=stationRecord(raw,index),nominalEirp=deriveNominalEirp(station),idealCarReception=deriveIdealCarReception(station);return nominalEirp?{...raw,nominalEirp,idealCarReception}:raw});
  try{writeJson(CONFIG,next);audit(req,area,what,'UPDATE');res.json(next)}catch(error){console.error('Configuration write failed:',error);res.status(500).json({error:'Unable to save configuration'})}
});

app.get('/api/audit',(req,res)=>res.json(readAudit()));
app.get('/api/admin/audit',(req,res)=>res.json(readAudit()));
app.post('/api/audit',(req,res)=>{const body=req.body||{};audit(req,String(body.category||'GUI'),String(body.detail||body.action||'GUI activity'),String(body.action||'ACTIVITY').toUpperCase(),'SUCCESS',body.actor);res.status(201).json({ok:true})});

app.post('/api/rf-estimate',(req,res)=>{
  const report=req.body||{},cfg=readConfig(),station=findStation(cfg,report),lat=finite(report.lat??report.latitude,-90,90),lon=finite(report.lon??report.lng??report.longitude,-180,180);
  if(!station)return res.status(400).json({error:'Selected station is not configured'});
  if(lat===null||lon===null)return res.status(400).json({error:'Valid GPS coordinates are required'});
  const rfEstimation=buildRfEstimate(station,{...report,lat,lon});
  res.json({ok:rfEstimation.status==='calculated-reference',siteId:station.id,siteName:station.name,distanceFromStationKm:rfEstimation.horizontalDistanceKm??distanceFromStation(station,{lat,lon}),referenceDistanceKm:rfEstimation.referenceDistanceKm??null,signalStrength:rfEstimation.estimatedSignalStrength,rfEstimation})
});

app.get('/api/incidents',(req,res)=>res.json(readIncidentViews()));
app.get('/api/public-incidents',(req,res)=>res.json(readPublicIncidentViews()));
app.get('/api/analysis/incidents',(req,res)=>res.json(readCombinedIncidentViews()));
app.get('/api/summary',(req,res)=>res.json(analysisSummary(readIncidentViews())));
app.get('/api/analysis/summary',(req,res)=>res.json(analysisSummary(readCombinedIncidentViews())));

app.post('/api/incidents',(req,res)=>{
  const r={...(req.body||{})},clientIncidentId=text(r.id),submissionKey=text(r.submissionKey)||clientIncidentId;
  delete r.id;
  const explicitType=text(r.reportType).toLowerCase();
  if(explicitType&&!['engineer','volunteer'].includes(explicitType))return res.status(400).json({error:'reportType must be engineer or volunteer'});
  r.reportType=explicitType||'engineer';
  const prior=existingSubmission(submissionKey);if(prior)return res.json({ok:true,duplicate:true,id:prior.id,serverReceivedAt:prior.serverReceivedAt||prior.datetime||null,reportType:prior.reportType||r.reportType,measurementSource:prior.measurementSource||null,storageSource:prior.storageSource||((prior.reportType||'engineer')==='volunteer'?'public':'field'),signalStrength:prior.signalStrength||null,observationAnalysis:prior.observationAnalysis||null});
  if(r.reportType==='engineer'&&!text(r.siteId))return res.status(400).json({error:'Station is required'});
  if(r.reportType==='engineer'&&!text(r.operator))return res.status(400).json({error:'Engineer / Operator is required'});
  const cfg=readConfig();
  if(r.reportType==='volunteer'){
    const valueFor={name:()=>text(r.reporterName),station:()=>text(r.siteId||r.siteName),channel:()=>text(r.channel),quality:()=>text(r.quality),stability:()=>text(r.stability),service:()=>text(r.service),comments:()=>text(r.comment)};
    const missing=requiredPublicFields(cfg).find(([key])=>!valueFor[key]());if(missing)return res.status(400).json({error:`${missing[1]} is required`});
  }
  const lat=finite(r.lat??r.latitude,-90,90),lon=finite(r.lon??r.lng??r.longitude,-180,180);
  if(cfg.gps?.required&&(lat===null||lon===null))return res.status(400).json({error:'GPS coordinates are required by configuration'});
  if(r.lat!==null&&r.lat!==undefined&&r.lat!==''&&lat===null)return res.status(400).json({error:'Invalid latitude'});
  if(r.lon!==null&&r.lon!==undefined&&r.lon!==''&&lon===null)return res.status(400).json({error:'Invalid longitude'});
  if(lat!==null)r.lat=lat;if(lon!==null)r.lon=lon;
  const configuredStations=stationsFromConfig(cfg),station=findStation(cfg,r);if(explicitType&&configuredStations.length&&!station&&(r.reportType==='engineer'||text(r.siteId)||text(r.siteName)))return res.status(400).json({error:'Selected station is not configured'});if(station?.enabled===false)return res.status(400).json({error:'Selected station is disabled'});
  if(station){r.siteId=station.id;r.siteName=station.name}
  const rfEstimation=buildRfEstimate(station,r);r.distanceFromStationKm=rfEstimation.horizontalDistanceKm??distanceFromStation(station,r);r.stationCoordinateStatus=!station?'station-not-configured':station.latitude===null||station.longitude===null?'coordinates-pending':'configured';
  r.geographicEnrichment={status:r.distanceFromStationKm===null?'unavailable':'calculated',method:'haversine',earthRadiusKm:6371.0088,distanceFromStationKm:r.distanceFromStationKm,stationCoordinates:station&&station.latitude!==null&&station.longitude!==null?{latitude:station.latitude,longitude:station.longitude}:null,reportCoordinates:lat!==null&&lon!==null?{latitude:lat,longitude:lon}:null};
  r.rfEstimation=rfEstimation;
  if(r.reportType==='volunteer'){
    r.measurementSource='estimated';r.reporterName=text(r.reporterName).slice(0,120);for(const key of ['ber','mer','snr','noise'])delete r[key];
    r.signalStrength=rfEstimation.estimatedSignalStrength||null;r.strength=r.signalStrength?String(r.signalStrength.value):'';r.unit=r.signalStrength?.unit||'dBµV/m';r.estimatedSignalStrength=r.signalStrength?.value??null;r.estimationMethod=rfEstimation.method;r.estimationModelVersion=rfEstimation.modelVersion;r.estimationConfidence=rfEstimation.confidence;r.sourceObservations={quality:text(r.quality)||null,stability:text(r.stability)||null,service:text(r.service)||null};r.observationAnalysis=observationAnalysis(r,cfg,'public');r.operator='Volunteer';r.status=text(r.status)||'Open';r.severity=text(r.severity)||'Auto';r.storageSource='public';
  }else{
    // Engineer report remains measured for field-instrument readings, while Signal Strength
    // is the server-authoritative estimated free-space reference from station data + live GPS.
    r.measurementSource='measured';
    r.estimationMethod=rfEstimation.method||null;
    r.estimationModelVersion=rfEstimation.modelVersion||null;
    r.estimationConfidence=rfEstimation.confidence||null;
    r.signalStrength=rfEstimation.estimatedSignalStrength||null;
    r.estimatedSignalStrength=r.signalStrength?.value??null;
    r.strength=r.signalStrength?String(r.signalStrength.value):'';
    r.unit=r.signalStrength?.unit||'dBµV/m';
    r.sourceObservations={quality:text(r.quality)||null,stability:text(r.stability)||null,service:text(r.service)||null};
    r.observationAnalysis=observationAnalysis(r,cfg,'field');
    r.storageSource='field';
  }
  const receivedAt=new Date();let identity;try{identity=generateIncidentIdentity(r.reportType,receivedAt)}catch(error){console.error('Incident ID generation failed:',error);return res.status(500).json({error:'Unable to generate incident ID'})}
  r.id=identity.id;r.idSequence=identity.sequence;r.idScheme=identity.scheme;r.idGeneratedAt=receivedAt.toISOString();
  if(submissionKey)r.submissionKey=submissionKey;if(clientIncidentId)r.clientIncidentId=clientIncidentId;
  r.serverReceivedAt=receivedAt.toISOString();r.syncState='synced';r.dataModelVersion='6.5.6-field-scores-server-ids';
  const file=r.reportType==='volunteer'?PUBLIC_DB:DB,rows=r.reportType==='volunteer'?readPublicIncidents():readIncidents();rows.unshift(r);
  try{writeJson(file,rows);audit(req,'Incidents',`Created ${r.id} (${r.reportType}/${r.measurementSource}/${r.storageSource})`,'CREATE','SUCCESS',r.operator||'Volunteer');res.status(201).json({ok:true,id:r.id,serverReceivedAt:r.serverReceivedAt,reportType:r.reportType,measurementSource:r.measurementSource,storageSource:r.storageSource,distanceFromStationKm:r.distanceFromStationKm,signalStrength:r.signalStrength,observationAnalysis:r.observationAnalysis||null,nominalEirp:r.rfEstimation.nominalEirp,idealCarReception:r.rfEstimation.idealCarReception})}catch(error){console.error('Incident write failed:',error);res.status(500).json({error:'Unable to save incident'})}
});

function storedIncident(id){for(const [file,rows,source] of [[DB,readIncidents(),'field'],[PUBLIC_DB,readPublicIncidents(),'public']]){const index=rows.findIndex(x=>x.id===id);if(index>=0)return {file,rows,index,source}}return null}
app.patch('/api/incidents/:id',(req,res)=>{
  const id=String(req.params.id||''),found=storedIncident(id);if(!found)return res.status(404).json({error:'Incident not found'});
  const allowed=new Set(['status','severity','operator','comment','channel','quality','stability','service','strength','unit','ber','mer','snr','noise']),patch={};for(const [key,value] of Object.entries(req.body||{}))if(allowed.has(key))patch[key]=value;
  const current=found.rows[found.index],isPublic=(current.reportType||'engineer')==='volunteer';if(isPublic)for(const key of ['strength','unit','ber','mer','snr','noise','operator'])delete patch[key];if(!isPublic&&Object.hasOwn(patch,'operator')&&!text(patch.operator))return res.status(400).json({error:'Engineer / Operator is required'});
  found.rows[found.index]={...current,...patch,lastUpdatedAt:new Date().toISOString()};const updated=found.rows[found.index];
  if(Object.keys(patch).some(key=>['quality','stability','service'].includes(key))){updated.sourceObservations={quality:text(updated.quality)||null,stability:text(updated.stability)||null,service:text(updated.service)||null};updated.observationAnalysis=observationAnalysis(updated,readConfig(),isPublic?'public':'field')}
  if(!isPublic&&(Object.hasOwn(patch,'strength')||Object.hasOwn(patch,'unit'))){const strength=finite(updated.strength,-Number.MAX_VALUE,Number.MAX_VALUE);updated.signalStrength=strength===null?null:{value:strength,unit:text(updated.unit)||'dBµV/m',source:'estimated',method:updated.estimationMethod||'ITU-R P.525 free-space reference',modelVersion:updated.estimationModelVersion||'free-space-reference-v1',calibrated:false}}
  try{writeJson(found.file,found.rows);audit(req,'Incidents',`Updated ${id}: ${Object.keys(patch).join(', ')||'no fields'}`,'UPDATE');res.json(incidentForDashboard(updated,readConfig(),found.source))}catch(error){console.error('Incident update failed:',error);res.status(500).json({error:'Unable to update incident'})}
});

app.delete('/api/incidents/:id',(req,res)=>{const id=String(req.params.id||''),found=storedIncident(id);if(!found)return res.status(404).json({error:'Incident not found'});const [removed]=found.rows.splice(found.index,1);try{writeJson(found.file,found.rows);audit(req,'Incidents',`Deleted ${id} from ${found.source} storage`,'DELETE');res.json({ok:true,id:removed.id,storageSource:found.source})}catch(error){console.error('Incident delete failed:',error);res.status(500).json({error:'Unable to delete incident'})}});

function exportCsv(res,rows,filename){const keys=['id','datetime','reportType','measurementSource','storageSource','reporterName','siteId','siteName','channel','strength','unit','quality','stability','service','severity','status','operator','lat','lon','accuracy','distanceFromStationKm','receptionExperienceIndex0to100','estimationMethod','estimationModelVersion','serverReceivedAt'],esc=value=>`"${String(value??'').replaceAll('"','""')}"`,value=(row,key)=>key==='receptionExperienceIndex0to100'?row.observationAnalysis?.receptionExperienceIndex0to100:row[key],lines=[keys.join(','),...rows.map(row=>keys.map(key=>esc(value(row,key))).join(','))];res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition',`attachment; filename="${filename}"`);res.send(lines.join('\r\n'))}
app.get('/api/incidents/export.csv',(req,res)=>exportCsv(res,readIncidentViews(),'MBI_Field_Signal_Incidents.csv'));
app.get('/api/analysis/incidents/export.csv',(req,res)=>exportCsv(res,readCombinedIncidentViews(),'MBI_Combined_Signal_Analysis.csv'));

app.use('/shared',express.static(path.join(__dirname,'../shared'),{etag:true,maxAge:'5m'}));
app.use('/admin',express.static(path.join(__dirname,'../admin'),{etag:true,maxAge:'5m'}));
app.use('/field',express.static(path.join(__dirname,'../field'),{etag:true,maxAge:'5m'}));
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'../index.html')));
const PORT=process.env.PORT||3000;
app.listen(PORT,'127.0.0.1',()=>console.log(`MBI Signal Logger API v6.5.13 on ${PORT} (field scores + server IDs)`));

let currentLang = 'vi';
let selectedBodyArea = '';
let selectedBodySide='';
let selectedBodySubArea='';
let activeArmSide='right';
let activeLimbType='arm';
let activeBodyView='front';
let activeBodyFocus='chest';
let selectedBodyRegionLabel=null;
let selectedBodyZones=[];
let selectedBodyGender='male';
let limb3DState=null;let limb3DRenderer=null;
let mediaStream = null;
let currentFacingMode = 'user';
let aiChatStep = 0;
let aiAnswers = [];
let aiFinished = false;
let isProfileCompleted = false;
let skippedProfile = false;
let isHealthCheckActive = false;
let pendingNavigate = null;
let lastResult = null;
const HEALTH_CHECK_DRAFT_KEY = 'healthguide-health-check-draft-v1';

const AREA_LABELS = {
  en: { Head:'Head', Neck:'Neck', Chest:'Chest', Abdomen:'Abdomen', Back:'Back', Arm:'Arm', Elbow:'Elbow', Hand:'Hand', Leg:'Leg', Skin:'Skin' },
  vi: { Head:'Đầu', Neck:'Cổ', Chest:'Ngực', Abdomen:'Bụng', Back:'Lưng', Arm:'Cánh tay', Elbow:'Khuỷu tay', Hand:'Bàn tay', Leg:'Chân', Skin:'Da' }
};
const ARM_DETAIL_LABELS={en:{upper:'Upper arm',elbow:'Elbow',forearm:'Forearm',wrist:'Wrist',hand:'Hand'},vi:{upper:'Bắp tay',elbow:'Khuỷu tay',forearm:'Cẳng tay',wrist:'Cổ tay',hand:'Bàn tay'}};
const LEG_DETAIL_LABELS={en:{thigh:'Thigh',knee:'Knee',lowerLeg:'Lower leg',foot:'Foot'},vi:{thigh:'Đùi',knee:'Đầu gối',lowerLeg:'Cẳng chân',foot:'Bàn chân'}};
const BODY_DETAIL_LABELS={en:{head:'Head',neck:'Neck',chest:'Chest',abdomen:'Abdomen',back:'Back'},vi:{head:'Đầu',neck:'Cổ',chest:'Ngực',abdomen:'Bụng',back:'Lưng'}};
const BODY_FOCUS_KEYS={front:{head:['front-head','front-scalp','front-forehead','front-eye','front-ear','front-nose','front-cheek','front-mouth','front-chin','front-jaw'],neck:['front-neck','front-throat'],chest:['front-chest','front-left-breast','front-right-breast'],abdomen:['front-abdomen','front-waist']},back:{head:['back-head','back-scalp','back-ear'],neck:['back-nape','back-neck','back-posterior-neck'],back:['back-upper-back','back-mid-back','back-lower-back','back-waist','back-lumbar-region','back-sacral-region','back-back']}};
const BODY_REGION_GROUPS={front:[{area:'Head',en:'Head & neck',vi:'Đầu & cổ',regions:[['front-head','Head','Đầu'],['front-scalp','Scalp','Da đầu'],['front-forehead','Forehead','Trán'],['front-eye','Eye','Mắt'],['front-ear','Ear','Tai'],['front-nose','Nose','Mũi'],['front-cheek','Cheek','Má'],['front-mouth','Mouth','Miệng'],['front-chin','Chin','Cằm'],['front-jaw','Jaw','Hàm'],['front-neck','Neck','Cổ'],['front-throat','Throat','Họng']]},{area:'Chest',en:'Middle torso',vi:'Phần giữa thân',regions:[['front-chest','Chest','Ngực'],['front-left-breast','Left breast','Ngực trái'],['front-right-breast','Right breast','Ngực phải'],['front-abdomen','Abdomen','Bụng'],['front-waist','Waist','Eo']]},{area:'Arm',en:'Shoulder to hand',vi:'Vai đến bàn tay',regions:[['front-shoulder','Shoulder','Vai'],['front-upper-arm','Upper arm','Cánh tay trên'],['front-elbow','Elbow','Khuỷu tay'],['front-forearm','Forearm','Cẳng tay'],['front-wrist','Wrist','Cổ tay'],['front-hand','Hand','Bàn tay'],['front-palm','Palm','Lòng bàn tay'],['front-thumb','Thumb','Ngón cái'],['front-index-finger','Index finger','Ngón trỏ'],['front-middle-finger','Middle finger','Ngón giữa'],['front-ring-finger','Ring finger','Ngón áp út'],['front-little-finger','Little finger','Ngón út']]},{area:'Pelvis',en:'Pelvis to thigh',vi:'Vùng chậu đến đùi',regions:[['front-pelvis','Pelvis','Vùng chậu'],['front-hip','Hip','Hông'],['front-pubic-region','Pubic region','Vùng mu'],['front-external-genitalia','External genitalia','Cơ quan sinh dục ngoài'],['front-thigh','Thigh','Đùi'],['front-anterior-thigh','Anterior thigh','Mặt trước đùi']]},{area:'Leg',en:'Knee to foot',vi:'Đầu gối đến bàn chân',regions:[['front-knee','Knee','Đầu gối'],['front-ankle','Ankle','Cổ chân'],['front-foot','Foot','Bàn chân'],['front-dorsum-foot','Dorsum of foot','Mu bàn chân'],['front-toes','Toes','Ngón chân'],['front-big-toe','Big toe','Ngón chân cái'],['front-little-toe','Little toe','Ngón chân út']]}],back:[{area:'Head',en:'Head & neck',vi:'Đầu & cổ',regions:[['back-head','Head','Đầu'],['back-scalp','Scalp','Da đầu'],['back-ear','Ear','Tai'],['back-nape','Nape','Gáy'],['back-neck','Neck','Cổ'],['back-posterior-neck','Posterior neck','Mặt sau cổ']]},{area:'Back',en:'Middle torso',vi:'Phần giữa thân',regions:[['back-upper-back','Upper back','Lưng trên'],['back-mid-back','Mid back','Lưng giữa'],['back-lower-back','Lower back','Lưng dưới'],['back-waist','Waist','Eo'],['back-lumbar-region','Lumbar region','Vùng thắt lưng'],['back-sacral-region','Sacral region','Vùng xương cùng'],['back-back','Back','Lưng']]},{area:'Arm',en:'Shoulder to hand',vi:'Vai đến bàn tay',regions:[['back-shoulder','Shoulder','Vai'],['back-scapular-region','Scapular region','Vùng bả vai'],['back-posterior-upper-arm','Posterior upper arm','Mặt sau cánh tay trên'],['back-elbow','Elbow','Khuỷu tay'],['back-forearm','Forearm','Cẳng tay'],['back-wrist','Wrist','Cổ tay'],['back-dorsum-hand','Dorsum of hand','Mu bàn tay'],['back-thumb','Thumb','Ngón cái'],['back-index-finger','Index finger','Ngón trỏ'],['back-middle-finger','Middle finger','Ngón giữa'],['back-ring-finger','Ring finger','Ngón áp út'],['back-little-finger','Little finger','Ngón út']]},{area:'Pelvis',en:'Pelvis to thigh',vi:'Vùng chậu đến đùi',regions:[['back-hip','Hip','Hông'],['back-pelvic-region','Pelvic region','Vùng chậu'],['back-buttock','Buttock','Mông'],['back-gluteal-region','Gluteal region','Vùng mông'],['back-posterior-thigh','Posterior thigh','Mặt sau đùi']]},{area:'Leg',en:'Knee to foot',vi:'Đầu gối đến bàn chân',regions:[['back-popliteal-region','Popliteal region','Vùng khoeo'],['back-knee','Knee','Đầu gối'],['back-calf','Calf','Bắp chân'],['back-ankle','Ankle','Cổ chân'],['back-heel','Heel','Gót chân'],['back-foot','Foot','Bàn chân'],['back-sole','Sole','Lòng bàn chân'],['back-toes','Toes','Ngón chân']]}]};
const AI_QUESTIONS = {
  en: ["You selected <strong>{area}</strong>. How long have symptoms lasted?","How severe? (Mild / Moderate / Severe)","Getting worse, same, or improving?","Any fever, fatigue, or nausea?","Thank you. Enough for a reference summary."],
  vi: ["Bạn chọn vùng <strong>{area}</strong>. Triệu chứng khoảng bao lâu?","Mức độ? (Nhẹ / Trung bình / Nặng)","Nặng hơn, giữ nguyên hay đỡ hơn?","Có sốt, mệt, buồn nôn không?","Cảm ơn. Đã đủ thông tin tham khảo."]
};
const QUICK_OPTIONS = {
  en: [["Today","1–3 days","More than a week"],["Mild","Moderate","Severe"],["Getting worse","Same","Improving"],["Yes","No","Not sure"]],
  vi: [["Hôm nay","1–3 ngày","Hơn 1 tuần"],["Nhẹ","Trung bình","Nặng"],["Nặng hơn","Giữ nguyên","Đang đỡ"],["Có","Không","Không chắc"]]
};
const DISEASES = [
  { id:'Dengue', tag:'Viral', en:{name:'Dengue Fever', desc:'Mosquito-borne infection.', detail:'High fever, headache, muscle pain, rash.'}, vi:{name:'Sốt xuất huyết', desc:'Bệnh do muỗi.', detail:'Sốt cao, đau đầu, đau cơ, phát ban.'} },
  { id:'Cold', tag:'Respiratory', en:{name:'Common Cold', desc:'Mild respiratory infection.', detail:'Runny nose, sore throat, cough.'}, vi:{name:'Cảm lạnh', desc:'Nhiễm trùng hô hấp nhẹ.', detail:'Sổ mũi, đau họng, ho.'} },
  { id:'Flu', tag:'Viral', en:{name:'Influenza', desc:'Contagious illness.', detail:'Sudden fever, body aches, fatigue.'}, vi:{name:'Cúm', desc:'Bệnh truyền nhiễm.', detail:'Sốt cao đột ngột, đau nhức, mệt.'} },
  { id:'Asthma', tag:'Chronic', en:{name:'Asthma', desc:'Chronic airway condition.', detail:'Shortness of breath, wheezing.'}, vi:{name:'Hen suyễn', desc:'Bệnh đường thở mạn tính.', detail:'Khó thở, khò khè.'} },
  { id:'Diabetes', tag:'Metabolic', en:{name:'Diabetes', desc:'Blood sugar disorder.', detail:'Thirst, frequent urination, fatigue.'}, vi:{name:'Tiểu đường', desc:'Rối loạn đường huyết.', detail:'Khát nhiều, tiểu nhiều, mệt.'} },
  { id:'Migraine', tag:'Neurological', en:{name:'Migraine', desc:'Severe headaches.', detail:'Headache with nausea, light sensitivity.'}, vi:{name:'Đau nửa đầu', desc:'Đau đầu dữ dội.', detail:'Đau đầu, buồn nôn, sợ ánh sáng.'} },
  { id:'HTN', tag:'Chronic', en:{name:'Hypertension', desc:'High blood pressure.', detail:'Often silent; heart and stroke risk.'}, vi:{name:'Tăng huyết áp', desc:'Huyết áp cao.', detail:'Thường im lặng; nguy cơ tim, đột quỵ.'} },
  { id:'Gastritis', tag:'Digestive', en:{name:'Gastritis', desc:'Stomach lining inflammation.', detail:'Upper abdominal pain, nausea.'}, vi:{name:'Viêm dạ dày', desc:'Viêm niêm mạc dạ dày.', detail:'Đau thượng vị, buồn nôn.'} },
  { id:'Rhinitis', tag:'Allergy', en:{name:'Allergic Rhinitis', desc:'Nose allergy.', detail:'Sneezing, runny nose, itchy eyes.'}, vi:{name:'Viêm mũi dị ứng', desc:'Dị ứng mũi.', detail:'Hắt hơi, sổ mũi, ngứa mắt.'} }
];
const TAG_I18N = { en:{Viral:'Viral',Respiratory:'Respiratory',Chronic:'Chronic',Metabolic:'Metabolic',Neurological:'Neurological',Digestive:'Digestive',Allergy:'Allergy'}, vi:{Viral:'Virus',Respiratory:'Hô hấp',Chronic:'Mạn tính',Metabolic:'Chuyển hóa',Neurological:'Thần kinh',Digestive:'Tiêu hóa',Allergy:'Dị ứng'} };
const HISTORY_DATA = [
  { en:{date:'August 20, 2026', note:'Headache, Fatigue (Head)', badge:'Common Cold'}, vi:{date:'20 tháng 8, 2026', note:'Đau đầu, mệt (Đầu)', badge:'Cảm lạnh'} },
  { en:{date:'August 12, 2026', note:'Chest discomfort (Chest)', badge:'Muscle strain'}, vi:{date:'12 tháng 8, 2026', note:'Khó chịu ngực (Ngực)', badge:'Căng cơ'} },
  { en:{date:'July 28, 2026', note:'Skin rash (Skin)', badge:'Allergic reaction'}, vi:{date:'28 tháng 7, 2026', note:'Phát ban (Da)', badge:'Phản ứng dị ứng'} }
];
const LESSONS = {
  cpr:{ en:`<h3>CPR – Hands-only</h3><ol><li>Call 115.</li><li>Hand on center of chest.</li><li>Push 100–120/min.</li><li>Continue until help arrives.</li></ol>`, vi:`<h3>CPR – Chỉ dùng tay</h3><ol><li>Gọi 115.</li><li>Tay giữa ngực.</li><li>Ấn 100–120 lần/phút.</li><li>Tiếp tục đến khi có hỗ trợ.</li></ol>` },
  stroke:{ en:`<h3>Stroke – FAST</h3><ul><li><strong>F</strong> Face droop</li><li><strong>A</strong> Arm weakness</li><li><strong>S</strong> Speech difficulty</li><li><strong>T</strong> Call 115</li></ul>`, vi:`<h3>Đột quỵ – FAST</h3><ul><li><strong>F</strong> Mặt xệ</li><li><strong>A</strong> Yếu tay</li><li><strong>S</strong> Nói khó</li><li><strong>T</strong> Gọi 115</li></ul>` },
  choking:{ en:`<h3>Choking – Heimlich</h3><ol><li>Ask if choking.</li><li>Fist above navel.</li><li>Thrust inward and up.</li></ol>`, vi:`<h3>Hóc – Heimlich</h3><ol><li>Hỏi có bị hóc không.</li><li>Nắm đấm trên rốn.</li><li>Đẩy vào trong và lên.</li></ol>` },
  dengue:{ en:`<h3>Dengue warning</h3><ul><li>Severe abdominal pain</li><li>Persistent vomiting</li><li>Bleeding</li><li>Extreme fatigue</li></ul>`, vi:`<h3>Cảnh báo sốt xuất huyết</h3><ul><li>Đau bụng dữ dội</li><li>Nôn nhiều</li><li>Chảy máu</li><li>Mệt lả</li></ul>` },
  burn:{ en:`<h3>Minor burn</h3><ol><li>Cool water 10–20 min.</li><li>No ice/butter.</li><li>Cover loosely.</li></ol>`, vi:`<h3>Bỏng nhẹ</h3><ol><li>Nước mát 10–20 phút.</li><li>Không đá/bơ.</li><li>Che nhẹ.</li></ol>` },
  fever:{ en:`<h3>Fever at home</h3><ul><li>Rest, fluids.</li><li>Light clothing.</li><li>Watch warning signs.</li></ul>`, vi:`<h3>Sốt tại nhà</h3><ul><li>Nghỉ ngơi, uống nước.</li><li>Mặc mỏng.</li><li>Theo dõi dấu hiệu nguy hiểm.</li></ul>` }
};
const EM_GUIDES = {
  stroke:{ en:`<h3 style="color:var(--danger)">Stroke – FAST</h3><div class="fast-box"><div class="fast-item"><strong>F</strong><span>Face</span></div><div class="fast-item"><strong>A</strong><span>Arms</span></div><div class="fast-item"><strong>S</strong><span>Speech</span></div><div class="fast-item"><strong>T</strong><span>115</span></div></div><ol class="step-list"><li>Call <strong>115</strong>.</li><li>Keep still. No food/drink.</li><li>Check breathing → CPR if needed.</li><li>Stay until help arrives.</li></ol>`, vi:`<h3 style="color:var(--danger)">Đột quỵ – FAST</h3><div class="fast-box"><div class="fast-item"><strong>F</strong><span>Mặt</span></div><div class="fast-item"><strong>A</strong><span>Tay</span></div><div class="fast-item"><strong>S</strong><span>Nói</span></div><div class="fast-item"><strong>T</strong><span>115</span></div></div><ol class="step-list"><li>Gọi <strong>115</strong>.</li><li>Nằm yên. Không ăn uống.</li><li>Kiểm tra thở → CPR nếu cần.</li><li>Ở bên đến khi có người đến.</li></ol>` },
  cpr:{ en:`<h3 style="color:var(--danger)">CPR</h3><ol class="step-list"><li>Call <strong>115</strong>.</li><li>Flat surface.</li><li>Hands on center of chest.</li><li>Push <strong>100–120/min</strong>.</li><li>Continue until help arrives.</li></ol>`, vi:`<h3 style="color:var(--danger)">CPR</h3><ol class="step-list"><li>Gọi <strong>115</strong>.</li><li>Mặt phẳng cứng.</li><li>Tay giữa ngực.</li><li>Ấn <strong>100–120 lần/phút</strong>.</li><li>Tiếp tục đến khi có hỗ trợ.</li></ol>` },
  choking:{ en:`<h3 style="color:var(--danger)">Choking</h3><ol class="step-list"><li>Confirm choking.</li><li>Call <strong>115</strong>.</li><li>Heimlich thrusts.</li><li>If unresponsive → CPR.</li></ol>`, vi:`<h3 style="color:var(--danger)">Hóc dị vật</h3><ol class="step-list"><li>Xác nhận bị hóc.</li><li>Gọi <strong>115</strong>.</li><li>Thủ thuật Heimlich.</li><li>Bất tỉnh → CPR.</li></ol>` }
};

const translations = {
  en: {
    navMain:"MAIN", navAccount:"ACCOUNT", home:"Home", healthCheck:"Health Check", miniLesson:"Mini Lesson", diseaseLibrary:"Disease Library",
    nearbyHealthcare:"Nearby", history:"History", profile:"Profile", emergency:"Emergency",
    healthEducation:"HEALTH EDUCATION PLATFORM", heroTitle1:"Understand symptoms.", heroTitle2:"Know what to do next.",
    heroDescription:"HealthGuide AI helps you organize symptoms and explore educational health information — clearly, step by step.",
    startHealthCheck:"Start Health Check →", educationOnly:"Educational information only. Not a medical diagnosis. Seek professional care when needed.",
    badgeEdu:"✓ Education only", badgeNotDx:"Not a diagnosis", badgeStudent:"Student project",
    aboutApp:"About the app", aboutTitle:"What you can do",
    aboutDesc:"A student-built health education tool to organize symptoms and learn safely.",
    feat1:"Guided Health Check (reference only)", feat2:"Disease library & short lessons", feat3:"Emergency tips & call 115 reminder",
    trust1Title:"Clear limits", trust1Text:"We state up front this is education — not clinical diagnosis.",
    trust2Title:"Structured flow", trust2Text:"Symptoms are organized step by step before any reference summary.",
    trust3Title:"Safety first", trust3Text:"Emergency guidance and 115 reminder when urgent signs appear.",
    exploreTools:"Explore tools",
    homeDisclaimer:"For education only; not a substitute for medical care. In an emergency, call 115.",
    viewAnalysis:"View detailed analysis →", backToResult:"← Back to result",
    miniLessonDesc:"Short lessons under 3 minutes.", diseaseLibraryDesc:"Explore common conditions.", nearbyDesc:"Find healthcare nearby.", emergencyDesc:"First-aid guidance.",
    step1:"HEALTH CHECK · STEP 1/4", step2:"HEALTH CHECK · STEP 2/4", step3:"HEALTH CHECK · STEP 3/4", step4:"HEALTH CHECK · STEP 4/4",
    whereProblem:"Where is the problem?", selectBodyMap:"Choose one or more areas. Tap again to remove.", bodyTypeLabel:"Body type", bodyMale:"Male", bodyFemale:"Female", selectedAreasLabel:"Selected",
    noAreaSelected:"No area selected yet", orTapBelow:"Or tap a label:",
    areaHead:"Head", areaNeck:"Neck", areaChest:"Chest", areaAbdomen:"Abdomen", areaBack:"Back", areaArm:"Arm", areaElbow:"Elbow", areaHand:"Hand", areaLeg:"Leg", areaSkin:"Skin",
    back:"Back", continue:"Continue →", exitCheck:"Exit check", selectedRegion:"Selected area", skinSurface:"Skin surface", simpleInside:"Simple internal view", noVesselsNote:"Simplified illustration · no blood vessels", chooseArmRegion:"Choose a spot on the arm", orChooseArmRegion:"Or choose a spot:", upperArm:"Upper arm", elbowRegion:"Elbow", forearm:"Forearm", wrist:"Wrist", handRegion:"Hand", backToBody:"← Back to whole body", rightArmTitle:"Your right arm", leftArmTitle:"Your left arm", rightArmHint:"The front-view figure shows your right arm on the left side of the picture. Choose the closest spot.", leftArmHint:"Choose the closest spot on your left arm.",
    scanAffected:"Scan affected area", positionArea:"Live camera or upload photo (optional).",
    cameraOff:"Camera is off", cameraScanTitle:"Camera & Photo", openCamera:"Open Camera", switchCam:"Switch", stopCamera:"Stop", uploadPhoto:"Upload Photo", cameraStatusOff:"Camera is currently off.",
    retryCam:"Retry", skipCam:"Skip",
    aiInterview:"AI Health Interview", aiInterviewDesc:"AI will ask a few questions first.", educationalAssistant:"Educational assistant", send:"Send", seeResult:"See Result →", chatPlaceholder:"Type your answer...",
    finishChatFirst:"Answer all questions to see the result.",
    referenceResult:"Reference Result", resultsSub:"Summary based on your answers.",
    explanation:"Explanation", supportingFactors:"Supporting factors", recommendedAction:"Recommended action", warningSigns:"Warning signs", nearbyFacilities:"Nearby emergency facilities",
    summary:"Summary", bodyArea:"Body Area", yourAnswers:"Your answers", noticeTitle:"Important:", backHome:"Back to Home", newCheck:"New Check",
    limitedNote:"You skipped some information. Results may be less accurate.",
    resultStatusRef:"Reference assessment", resultStatusUrgent:"Needs attention / urgent",
    possibleCondition:"Possible related condition",
    possibleConditionNote:"",
    whyThisCondition:"Why we suggest this",
    explanation:"Analysis",
    lessonEyebrow:"QUICK LEARNING", miniLessonSub:"Short lessons under 3 minutes.", tagFirstAid:"FIRST AID", tagEmergency:"EMERGENCY", tagCommon:"COMMON", min:"min",
    lessonCprTitle:"CPR Basics", lessonCprDesc:"Hands-only CPR.", lessonStrokeTitle:"Spot a Stroke (FAST)", lessonStrokeDesc:"Recognize stroke signs.",
    lessonChokingTitle:"Choking – Heimlich", lessonChokingDesc:"Help someone choking.", lessonDengueTitle:"Dengue Warning Signs", lessonDengueDesc:"When to seek care.",
    lessonBurnTitle:"Minor Burn Care", lessonBurnDesc:"Small burn care.", lessonFeverTitle:"Fever at Home", lessonFeverDesc:"Manage mild fever.", backToLessons:"← Back to lessons",
    libraryEyebrow:"KNOWLEDGE BASE", libraryDesc:"Explore educational guides.", searchDiseases:"Search diseases...", noDiseaseFound:"No matching diseases found.",
    locatorEyebrow:"LOCATOR", allowLocation:"Allow Location", locationNotRequested:"Location status: Not requested",
    historyEyebrow:"LOGS", historySub:"Previous assessments.",
    profileEyebrow:"USER SETTINGS", profileSub:"Manage your personal information.", personalInfo:"Personal Information", name:"Name *", age:"Age *", sex:"Sex", height:"Height (cm)", weight:"Weight (kg)",
    clickUpload:"Click to upload avatar", select:"Select", male:"Male", female:"Female", other:"Other", healthInfo:"Health Information",
    existingConditions:"Existing Conditions", allergies:"Allergies", currentMedications:"Current Medications", familyHistory:"Family History",
    phConditions:"e.g. Asthma", phAllergies:"e.g. Penicillin", saveProfile:"Save Profile",
    emergencyEyebrow:"URGENT SUPPORT", emergencySub:"Select situation. Call 115 first, then follow steps.",
    emStroke:"Suspected Stroke", emStrokeDesc:"Face droop, arm weakness, speech difficulty.", emCPR:"Unresponsive / Not breathing", emCPRDesc:"Not responding, not breathing normally.",
    emChoking:"Choking", emChokingDesc:"Cannot speak, cough or breathe.", emGeneralNote:"If life-threatening, call 115 immediately.",
    callEmergency:"Call 115", callFirst:"1. Call 115 first", callFirstText:"While waiting, follow the steps below.", backToSituations:"← Back", relatedLesson:"Related Mini Lesson",
    errorName:"Name is required.", errorAge:"Age must be 1–120.", errorHeight:"Invalid height.", errorWeight:"Invalid weight.",
    profileChoiceTitle:"Before starting", profileChoiceText:"Profile helps better results. You can skip, but results may be less accurate.",
    skipProfile:"Skip Profile", fillProfile:"Fill Profile", callTitle:"Call 115", callText:"Prototype only. In a real emergency, dial 115.",
    ok:"OK", profileSaved:"Profile saved!", guest:"Guest",
    checkInProgress:"Your Health Check is saved on this device. You can resume later.",
    exitTitle:"Leave Health Check?", exitText:"Your progress will be saved on this device. You can continue when you return.",
    stay:"Stay", leaveAnyway:"Save and leave",
    resumeCheckTitle:"You have an unfinished health check",
    resumeCheckText:"Would you like to continue where you left off or start over?",
    continueCheck:"Continue", restartCheck:"Start over"
  },
  vi: {
    navMain:"CHÍNH", navAccount:"TÀI KHOẢN", home:"Trang chủ", healthCheck:"Kiểm tra sức khỏe", miniLesson:"Bài học ngắn", diseaseLibrary:"Thư viện bệnh học",
    nearbyHealthcare:"Gần đây", history:"Lịch sử", profile:"Hồ sơ", emergency:"Khẩn cấp",
    healthEducation:"NỀN TẢNG GIÁO DỤC SỨC KHỎE", heroTitle1:"Hiểu triệu chứng.", heroTitle2:"Biết bước tiếp theo.",
    heroDescription:"HealthGuide AI giúp bạn tổ chức triệu chứng và xem thông tin sức khỏe giáo dục — rõ ràng, theo từng bước.",
    startHealthCheck:"Bắt đầu kiểm tra →", educationOnly:"Chỉ thông tin giáo dục. Không phải chẩn đoán y khoa. Hãy tìm hỗ trợ chuyên môn khi cần.",
    badgeEdu:"✓ Chỉ giáo dục", badgeNotDx:"Không chẩn đoán", badgeStudent:"Dự án học sinh",
    aboutApp:"Về ứng dụng", aboutTitle:"Bạn có thể làm gì",
    aboutDesc:"Công cụ giáo dục sức khỏe do học sinh làm, giúp sắp xếp triệu chứng và học an toàn.",
    feat1:"Health Check có hướng dẫn (chỉ tham khảo)", feat2:"Thư viện bệnh & bài học ngắn", feat3:"Mẹo cấp cứu & nhắc gọi 115",
    trust1Title:"Ranh giới rõ", trust1Text:"Nói thẳng đây là giáo dục — không phải chẩn đoán lâm sàng.",
    trust2Title:"Quy trình có cấu trúc", trust2Text:"Triệu chứng được sắp xếp từng bước trước khi có tóm tắt tham khảo.",
    trust3Title:"An toàn trước", trust3Text:"Có hướng dẫn khẩn cấp và nhắc gọi 115 khi có dấu hiệu nguy hiểm.",
    exploreTools:"Công cụ khác",
    homeDisclaimer:"Chỉ dùng để tham khảo, không thay thế bác sĩ. Trường hợp khẩn cấp, gọi 115.",
    viewAnalysis:"Xem phân tích chi tiết →", backToResult:"← Về kết quả",
    miniLessonDesc:"Bài học ngắn dưới 3 phút.", diseaseLibraryDesc:"Khám phá các tình trạng phổ biến.", nearbyDesc:"Tìm cơ sở y tế gần bạn.", emergencyDesc:"Hướng dẫn sơ cứu.",
    step1:"KIỂM TRA · BƯỚC 1/4", step2:"KIỂM TRA · BƯỚC 2/4", step3:"KIỂM TRA · BƯỚC 3/4", step4:"KIỂM TRA · BƯỚC 4/4",
    whereProblem:"Vấn đề ở khu vực nào?", selectBodyMap:"Chọn một hoặc nhiều vùng. Chạm lại để bỏ chọn.", bodyTypeLabel:"Hình thể", bodyMale:"Nam", bodyFemale:"Nữ", selectedAreasLabel:"Đã chọn",
    noAreaSelected:"Chưa chọn vùng nào", orTapBelow:"Hoặc chọn nhãn:",
    areaHead:"Đầu", areaNeck:"Cổ", areaChest:"Ngực", areaAbdomen:"Bụng", areaBack:"Lưng", areaArm:"Cánh tay", areaElbow:"Khủy tay", areaHand:"Bàn tay", areaLeg:"Chân", areaSkin:"Da",
    back:"Quay lại", continue:"Tiếp tục →", exitCheck:"Thoát kiểm tra", selectedRegion:"Vị trí đã chọn", skinSurface:"Bề mặt da", simpleInside:"Hình minh họa bên trong", noVesselsNote:"Minh họa đơn giản · không có mạch máu", chooseArmRegion:"Chọn vị trí trên hình", orChooseArmRegion:"Hoặc chọn một vị trí:", upperArm:"Bắp tay", elbowRegion:"Khuỷu tay", forearm:"Cẳng tay", wrist:"Cổ tay", handRegion:"Bàn tay", backToBody:"← Quay lại toàn thân", rightArmTitle:"Tay phải của bạn", leftArmTitle:"Tay trái của bạn", rightArmHint:"Hình nhìn từ phía trước nên tay phải của bạn nằm ở bên trái hình. Chọn vị trí gần nhất.", leftArmHint:"Chọn vị trí gần nhất trên tay trái của bạn.",
    scanAffected:"Quét vùng bị ảnh hưởng", positionArea:"Camera hoặc tải ảnh (không bắt buộc).",
    cameraOff:"Camera đang tắt", cameraScanTitle:"Camera & Ảnh", openCamera:"Mở Camera", switchCam:"Đổi cam", stopCamera:"Tắt", uploadPhoto:"Tải ảnh lên", cameraStatusOff:"Camera hiện đang tắt.",
    retryCam:"Thử lại", skipCam:"Bỏ qua",
    aiInterview:"Phỏng vấn sức khỏe AI", aiInterviewDesc:"AI sẽ hỏi trước một vài câu.", educationalAssistant:"Trợ lý giáo dục", send:"Gửi", seeResult:"Xem kết quả →", chatPlaceholder:"Nhập câu trả lời...",
    finishChatFirst:"Trả lời hết câu hỏi để xem kết quả.",
    referenceResult:"Kết quả tham khảo", resultsSub:"Tóm tắt dựa trên câu trả lời của bạn.",
    explanation:"Giải thích", supportingFactors:"Yếu tố hỗ trợ", recommendedAction:"Hành động đề xuất", warningSigns:"Dấu hiệu cảnh báo", nearbyFacilities:"Cơ sở cấp cứu gần đây",
    summary:"Tóm tắt", bodyArea:"Vùng cơ thể", yourAnswers:"Câu trả lời của bạn", noticeTitle:"Lưu ý:", backHome:"Về trang chủ", newCheck:"Kiểm tra mới",
    limitedNote:"Bạn đã bỏ qua một số thông tin. Kết quả có thể kém chính xác hơn.",
    resultStatusRef:"Đánh giá tham khảo", resultStatusUrgent:"Cần chú ý / khẩn cấp",
    possibleCondition:"Tình trạng có thể liên quan",
    possibleConditionNote:"",
    whyThisCondition:"Vì sao nghĩ bạn có thể bị bệnh đó",
    explanation:"Phân tích",
    lessonEyebrow:"HỌC NHANH", miniLessonSub:"Bài học ngắn dưới 3 phút.", tagFirstAid:"SƠ CỨU", tagEmergency:"CẤP CỨU", tagCommon:"THƯỜNG GẶP", min:"phút",
    lessonCprTitle:"CPR cơ bản", lessonCprDesc:"CPR chỉ dùng tay.", lessonStrokeTitle:"Nhận biết đột quỵ (FAST)", lessonStrokeDesc:"Nhận dấu hiệu đột quỵ.",
    lessonChokingTitle:"Hóc dị vật – Heimlich", lessonChokingDesc:"Giúp người bị hóc.", lessonDengueTitle:"Dấu hiệu sốt xuất huyết", lessonDengueDesc:"Khi nào cần đi khám.",
    lessonBurnTitle:"Xử lý bỏng nhẹ", lessonBurnDesc:"Cách xử lý bỏng nhỏ.", lessonFeverTitle:"Xử lý sốt tại nhà", lessonFeverDesc:"Quản lý sốt nhẹ.", backToLessons:"← Về danh sách bài học",
    libraryEyebrow:"CƠ SỞ KIẾN THỨC", libraryDesc:"Khám phá hướng dẫn giáo dục.", searchDiseases:"Tìm bệnh...", noDiseaseFound:"Không tìm thấy bệnh phù hợp.",
    locatorEyebrow:"ĐỊNH VỊ", allowLocation:"Cho phép vị trí", locationNotRequested:"Trạng thái vị trí: Chưa yêu cầu",
    historyEyebrow:"NHẬT KÝ", historySub:"Các lần đánh giá trước.",
    profileEyebrow:"CÀI ĐẶT", profileSub:"Quản lý thông tin cá nhân.", personalInfo:"Thông tin cá nhân", name:"Họ tên *", age:"Tuổi *", sex:"Giới tính", height:"Chiều cao (cm)", weight:"Cân nặng (kg)",
    clickUpload:"Bấm để tải ảnh đại diện", select:"Chọn", male:"Nam", female:"Nữ", other:"Khác", healthInfo:"Thông tin sức khỏe",
    existingConditions:"Bệnh lý nền", allergies:"Dị ứng", currentMedications:"Thuốc đang dùng", familyHistory:"Tiền sử gia đình",
    phConditions:"vd: Hen suyễn", phAllergies:"vd: Penicillin", saveProfile:"Lưu hồ sơ",
    emergencyEyebrow:"HỖ TRỢ KHẨN CẤP", emergencySub:"Chọn tình huống. Gọi 115 trước, rồi làm theo bước.",
    emStroke:"Nghi ngờ đột quỵ", emStrokeDesc:"Mặt xệ, yếu tay, nói khó.", emCPR:"Không đáp ứng / Không thở", emCPRDesc:"Không đáp ứng, không thở bình thường.",
    emChoking:"Hóc dị vật", emChokingDesc:"Không nói, ho hoặc thở được.", emGeneralNote:"Nếu nguy hiểm đến tính mạng, gọi 115 ngay.",
    callEmergency:"Gọi 115", callFirst:"1. Gọi 115 trước", callFirstText:"Trong khi chờ, làm theo các bước dưới.", backToSituations:"← Quay lại", relatedLesson:"Bài học liên quan",
    errorName:"Vui lòng nhập họ tên.", errorAge:"Tuổi từ 1–120.", errorHeight:"Chiều cao không hợp lệ.", errorWeight:"Cân nặng không hợp lệ.",
    profileChoiceTitle:"Trước khi bắt đầu", profileChoiceText:"Profile giúp kết quả tốt hơn. Có thể bỏ qua nhưng kết quả kém chính xác hơn.",
    skipProfile:"Bỏ qua Profile", fillProfile:"Điền Profile", callTitle:"Gọi 115", callText:"Đây là prototype. Khẩn cấp thật hãy gọi 115 trên điện thoại.",
    ok:"OK", profileSaved:"Đã lưu hồ sơ!", guest:"Khách",
    checkInProgress:"Bài kiểm tra được lưu trên thiết bị này. Bạn có thể tiếp tục sau.",
    exitTitle:"Thoát kiểm tra?", exitText:"Tiến trình sẽ được lưu trên thiết bị này. Bạn có thể tiếp tục khi quay lại.",
    stay:"Ở lại", leaveAnyway:"Lưu và thoát",
    resumeCheckTitle:"Bạn có bài kiểm tra chưa hoàn tất",
    resumeCheckText:"Bạn muốn tiếp tục từ chỗ đang làm hay bắt đầu lại?",
    continueCheck:"Tiếp tục", restartCheck:"Bắt đầu lại"
  }
};

function setResultBtn(enabled) {
  document.getElementById('btnToResult').disabled = !enabled;
  const hint = document.getElementById('resultHint');
  if (hint) hint.style.display = enabled ? 'none' : 'block';
}
function setCheckActive(active) {
  isHealthCheckActive = active;
  document.getElementById('sidebar').classList.toggle('locked', active);
  document.getElementById('checkLockBanner').classList.toggle('show', active);
}
function tryNavigate(pageId) {
  if (pageId === 'health-check' && !isHealthCheckActive && readHealthCheckDraft()) {
    showModal('resumeCheckModal'); return;
  }
  if (isHealthCheckActive && pageId !== 'health-check') {
    pendingNavigate = pageId;
    showModal('exitCheckModal');
    return;
  }
  openPage(pageId);
}
function tryNavigateEmergency() {
  if (isHealthCheckActive) {
    pendingNavigate = 'emergency';
    showModal('exitCheckModal');
    return;
  }
  openEmergency();
}
function requestExitCheck(pageId) {
  pendingNavigate = pageId || 'home';
  showModal('exitCheckModal');
}
function confirmExitCheck() {
  saveHealthCheckDraft();
  stopCamera();
  closeModal('exitCheckModal');
  setCheckActive(false);
  const dest = pendingNavigate || 'home';
  pendingNavigate = null;
  if (dest === 'emergency') openEmergency();
  else openPage(dest);
}
function finishCheckAndGo(pageId) {
  setCheckActive(false);
  clearHealthCheckData();
  skippedProfile = false;
  openPage(pageId);
}
function clearHealthCheckData() {
  try { sessionStorage.removeItem(HEALTH_CHECK_DRAFT_KEY); } catch (e) {}
  selectedBodyRegionLabel=null;selectedBodyArea = ''; selectedBodySide=''; selectedBodySubArea='';
  selectedBodyZones=[]; selectedBodyGender='male';
  document.querySelectorAll('.arm-detail-part').forEach(p=>p.classList.remove('selected'));
  document.querySelectorAll('[data-arm-region]').forEach(b=>b.classList.remove('active'));
  const armContinue=document.getElementById('btnArmContinue'); if(armContinue) armContinue.disabled=true;
  aiChatStep = 0; aiAnswers = []; aiFinished = false;
  lastResult = null;
  hideResultToasts();
  stopCamera();
  const img = document.getElementById('uploadedImage');
  if (img) { img.removeAttribute('src'); img.src = ''; }
  const camBox = document.getElementById('cameraBox');
  if (camBox) camBox.classList.remove('has-image', 'camera-active');
  const ph = document.getElementById('cameraPlaceholder');
  if (ph) ph.style.display = 'block';
  const photo = document.getElementById('photoUploadInput');
  if (photo) photo.value = '';
  const chat = document.getElementById('aiChatMessages');
  if (chat) chat.innerHTML = '';
  const quick = document.getElementById('quickReplies');
  if (quick) quick.innerHTML = '';
  const input = document.getElementById('aiChatInput');
  if (input) input.value = '';
  setResultBtn(false);
  document.querySelectorAll('.body-part').forEach(p => p.classList.remove('selected'));
  document.querySelectorAll('.area-chip').forEach(c => c.classList.remove('active'));
  const sel = document.getElementById('selectedDisplay');
  if (sel) sel.innerText = translations[currentLang].noAreaSelected;
  document.querySelectorAll('[data-body-gender]').forEach(button => { const active=button.dataset.bodyGender==='male'; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
  const femaleFigure=document.getElementById('femaleBodyFigure'); if(femaleFigure)femaleFigure.style.display='none';
  const maleFigure=document.getElementById('maleBodyImage'); if(maleFigure)maleFigure.style.display='';
  const btnCam = document.getElementById('btnToCamera');
  if (btnCam) btnCam.disabled = true;
  ['resultDiseaseName','resultExplanation','resultAction','resultActionShort','resultBody','resultAnswers'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = '—';
  });
  const warns = document.getElementById('resultWarnings');
  if (warns) warns.innerHTML = '';
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 850px)').matches;
}
function toggleMobileSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('active');
}
function closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
}
function toggleSidebarCollapse() {
  if (isMobileLayout()) {
    toggleMobileSidebar();
    return;
  }
  const sb = document.getElementById('sidebar');
  const collapsed = sb.classList.toggle('collapsed');
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  const btn = document.getElementById('sidebarCollapseBtn');
  if (btn) btn.innerText = collapsed ? '›' : '‹';
  try { localStorage.setItem('hg_sidebar_collapsed', collapsed ? '1' : '0'); } catch (e) {}
}
function toggleSidebarOrMobile() {
  if (isMobileLayout()) toggleMobileSidebar();
  else toggleSidebarCollapse();
}
function restoreSidebarState() {
  if (isMobileLayout()) return;
  try {
    if (localStorage.getItem('hg_sidebar_collapsed') === '1') {
      document.getElementById('sidebar').classList.add('collapsed');
      document.body.classList.add('sidebar-collapsed');
      const btn = document.getElementById('sidebarCollapseBtn');
      if (btn) btn.innerText = '›';
    }
  } catch (e) {}
  const edge = document.getElementById('sidebarCollapseBtn');
  if (edge) {
    edge.classList.add('hint');
    setTimeout(() => edge.classList.remove('hint'), 2800);
  }
}
window.addEventListener('resize', () => {
  if (isMobileLayout()) {
    document.getElementById('sidebar').classList.remove('collapsed');
    document.body.classList.remove('sidebar-collapsed');
  }
});
function showModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }
function showMessage(title, text) {
  document.getElementById('messageModalTitle').innerText = title;
  document.getElementById('messageModalText').innerText = text;
  showModal('messageModal');
}

function changeLanguage(lang) {
  currentLang = lang;
  document.getElementById('langEN').classList.toggle('active', lang === 'en');
  document.getElementById('langVI').classList.toggle('active', lang === 'vi');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) el.innerText = translations[lang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang][key]) el.placeholder = translations[lang][key];
  });
  renderAnatomyRegions();
  if (selectedBodyZones.length) updateBodySelectionUI();
  else if (selectedBodyArea) document.getElementById('selectedDisplay').innerText = getSelectedAreaLabel(lang);
  else document.getElementById('selectedDisplay').innerText = translations[lang].noAreaSelected;
  updateArmDetailLanguage(lang);
  renderDiseaseGrid();
  renderHistory();
  const n = document.getElementById('topUserName').innerText;
  if (n === 'Guest' || n === 'Khách') document.getElementById('topUserName').innerText = translations[lang].guest;
  // Refresh Result content if already on results page
  const resultsPage = document.getElementById('page-results');
  if (resultsPage && resultsPage.classList.contains('active') && selectedBodyArea) {
    goToResult();
  }
}

function openPage(pageId) {
  if (isHealthCheckActive) saveHealthCheckDraft();
  if (pageId !== 'results') hideResultToasts();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');
  document.querySelectorAll('.sidebar .nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
  });
  const activeNav = document.querySelector(`.sidebar .nav-item[data-page="${pageId}"]`);
  if (activeNav) {
    document.getElementById('pageTitle').innerText = activeNav.querySelector('[data-i18n]')?.innerText || pageId;
  }
  closeMobileSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (isHealthCheckActive) saveHealthCheckDraft(pageId);
}

function readHealthCheckDraft() {
  try {
    const raw = sessionStorage.getItem(HEALTH_CHECK_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (!draft.savedAt || Date.now() - draft.savedAt > 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem(HEALTH_CHECK_DRAFT_KEY); return null;
    }
    return draft;
  } catch (e) { return null; }
}
function saveHealthCheckDraft(pageId) {
  if (!isHealthCheckActive) return;
  const activePage = pageId || document.querySelector('.screen.active')?.id.replace(/^page-/, '') || 'health-check';
  if (activePage === 'results') { try { sessionStorage.removeItem(HEALTH_CHECK_DRAFT_KEY); } catch (e) {} return; }
  const imageSrc = document.getElementById('uploadedImage')?.getAttribute('src') || '';
  const draft = {
    savedAt: Date.now(), page: activePage, activeBodyView, activeBodyFocus, activeLimbType, activeArmSide,
    selectedBodyRegionLabel, selectedBodyArea, selectedBodySide, selectedBodySubArea, selectedBodyZones, selectedBodyGender,
    aiChatStep, aiAnswers, aiFinished, skippedProfile,
    uploadedImage: imageSrc.startsWith('data:image/') ? imageSrc : ''
  };
  try { sessionStorage.setItem(HEALTH_CHECK_DRAFT_KEY, JSON.stringify(draft)); }
  catch (e) {
    // Keep the symptom answers and step even if an uploaded image exceeds browser storage limits.
    draft.uploadedImage = '';
    try { sessionStorage.setItem(HEALTH_CHECK_DRAFT_KEY, JSON.stringify(draft)); } catch (_) {}
  }
}
function showHealthCheckResumePrompt() {
  if (readHealthCheckDraft()) showModal('resumeCheckModal');
}
function resumeCheckDraft() {
  const draft = readHealthCheckDraft();
  closeModal('resumeCheckModal');
  if (!draft) return startHealthCheck();
  activeBodyView = draft.activeBodyView === 'back' ? 'back' : 'front';
  activeBodyFocus = draft.activeBodyFocus || 'chest'; activeLimbType = draft.activeLimbType || 'arm';
  activeArmSide = draft.activeArmSide || 'right';
  selectedBodyRegionLabel = draft.selectedBodyRegionLabel || null;
  selectedBodyArea = draft.selectedBodyArea || ''; selectedBodySide = draft.selectedBodySide || '';
  selectedBodySubArea = draft.selectedBodySubArea || '';
  selectedBodyZones=Array.isArray(draft.selectedBodyZones)?draft.selectedBodyZones:(draft.selectedBodyArea?[{key:`${activeBodyView}:${draft.selectedBodyArea}:${draft.selectedBodySide||''}`,view:activeBodyView,area:draft.selectedBodyArea,side:draft.selectedBodySide||''}]:[]); selectedBodyGender=draft.selectedBodyGender==='female'?'female':'male';
  aiChatStep = Math.max(0, Number(draft.aiChatStep) || 0); aiAnswers = Array.isArray(draft.aiAnswers) ? draft.aiAnswers : [];
  aiFinished = !!draft.aiFinished; skippedProfile = !!draft.skippedProfile;
  isHealthCheckActive = true;
  setAnatomySide(activeBodyView);
  selectedBodyRegionLabel = draft.selectedBodyRegionLabel || null;
  selectedBodyArea = draft.selectedBodyArea || ''; selectedBodySide = draft.selectedBodySide || '';
  selectedBodySubArea = draft.selectedBodySubArea || '';
  renderAnatomyRegions();
   setBodyGender(selectedBodyGender); updateBodySelectionUI();
  setResultBtn(aiFinished); setCheckActive(true);
  if (draft.uploadedImage) {
    const image = document.getElementById('uploadedImage'); image.src = draft.uploadedImage;
    document.getElementById('cameraBox').classList.add('has-image');
    document.getElementById('cameraPlaceholder').style.display = 'none';
  }
  if (draft.page === 'body-detail') {
    if (activeLimbType === 'body') openBodyDetail(activeBodyFocus);
    else {
      openLimbDetail(activeArmSide, activeLimbType);
      selectedBodyRegionLabel = draft.selectedBodyRegionLabel || null;
      selectedBodyArea = draft.selectedBodyArea || '';
      selectedBodySide = draft.selectedBodySide || activeArmSide;
      selectedBodySubArea = draft.selectedBodySubArea || '';
      renderLimbOptions();
      document.querySelectorAll('[data-arm-region]').forEach(button => button.classList.toggle('active', button.dataset.armRegion === selectedBodySubArea));
      document.getElementById('armSelectedDisplay').innerText = `${translations[currentLang].selectedRegion}: ${getSelectedAreaLabel()}`;
      document.getElementById('btnArmContinue').disabled = !selectedBodySubArea;
      document.getElementById('btnToCamera').disabled = !selectedBodySubArea;
    }
  } else if (draft.page === 'camera') openPage('camera');
  else if (draft.page === 'ai-chat') {
    openPage('ai-chat');
    const messages = document.getElementById('aiChatMessages'); messages.innerHTML = '';
    const questions = AI_QUESTIONS[currentLang];
    aiAnswers.forEach((answer, index) => {
      const bot = document.createElement('div'); bot.className = 'ai-msg bot';
      bot.innerHTML = questions[index].replace('{area}', getSelectedAreaLabel()); messages.appendChild(bot);
      addUserMessage(answer);
    });
    if (!aiFinished && aiChatStep < questions.length) askNextAIQuestion();
    if (aiFinished) setResultBtn(true);
  } else openPage('health-check');
}
function restartCheckDraft() {
  closeModal('resumeCheckModal'); clearHealthCheckData();
  skippedProfile = false; setCheckActive(false);
  if (!isProfileCompleted) showModal('profileChoiceModal'); else beginHealthCheckFlow();
}
function startHealthCheck() {
  if (isHealthCheckActive) { openPage('health-check'); return; }
  if (readHealthCheckDraft()) { showModal('resumeCheckModal'); return; }
  clearHealthCheckData();
  skippedProfile = false;
  setCheckActive(false);
  if (!isProfileCompleted) { showModal('profileChoiceModal'); return; }
  beginHealthCheckFlow();
}
function goToFillProfile() { closeModal('profileChoiceModal'); openPage('profile'); }
function skipProfileAndStart() {
  closeModal('profileChoiceModal');
  beginHealthCheckFlow();
  skippedProfile = true;
}
function beginHealthCheckFlow() {
  clearHealthCheckData();
  setAnatomySide('front');
  setResultBtn(false);
  setCheckActive(true);
  openPage('health-check');
}

function setBodyGender(gender){selectedBodyGender=gender==='female'?'female':'male';document.querySelectorAll('[data-body-gender]').forEach(button=>{const active=button.dataset.bodyGender===selectedBodyGender;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});const female=document.getElementById('femaleBodyFigure');const male=document.getElementById('maleBodyImage');if(female)female.style.display=selectedBodyGender==='female'?'':'none';if(male)male.style.display=selectedBodyGender==='female'?'none':'';const contours=document.getElementById('femaleFrontContours');if(contours)contours.style.display=activeBodyView==='front'?'':'none';if(isHealthCheckActive)saveHealthCheckDraft();}
function bodyZoneLabel(zone,lang=currentLang){let area=zone.area;if(zone.view==='back'){area=({Head:lang==='vi'?'Đầu sau':'Back of head',Neck:lang==='vi'?'Gáy':'Nape',Chest:lang==='vi'?'Lưng trên':'Upper back',Abdomen:lang==='vi'?'Lưng dưới':'Lower back'})[area]||area;}else area=AREA_LABELS[lang][area]||area;if(zone.side){const side=zone.side==='right'?(lang==='vi'?'phải':'right'):(lang==='vi'?'trái':'left');const part=zone.area==='Arm'?(lang==='vi'?'Tay':'Arm'):(lang==='vi'?'Chân':'Leg');return `${part} ${side}`;}return area;}
function updateBodySelectionUI(){document.querySelectorAll('.body-svg-box .body-map-hit-area[data-area]').forEach(part=>{const key=`${activeBodyView}:${part.dataset.area}:${part.dataset.side||''}`;part.classList.toggle('selected',selectedBodyZones.some(zone=>zone.key===key));});selectedBodyArea=selectedBodyZones[0]?.area||'';selectedBodySide=selectedBodyZones[0]?.side||'';selectedBodyRegionLabel=null;selectedBodySubArea='';const labels=selectedBodyZones.map(zone=>bodyZoneLabel(zone));const display=document.getElementById('selectedDisplay');if(display)display.innerText=labels.length?`${translations[currentLang].selectedAreasLabel}: ${labels.join(' · ')}`:translations[currentLang].noAreaSelected;const next=document.getElementById('btnToCamera');if(next)next.disabled=!selectedBodyZones.length;}
function toggleBodyRegion(area,side=''){const key=`${activeBodyView}:${area}:${side}`;const index=selectedBodyZones.findIndex(zone=>zone.key===key);if(index>=0)selectedBodyZones.splice(index,1);else selectedBodyZones.push({key,view:activeBodyView,area,side});updateBodySelectionUI();saveHealthCheckDraft();}
function setAnatomySide(side){activeBodyView=side==='back'?'back':'front';document.getElementById('anatomyFrontBtn').classList.toggle('active',activeBodyView==='front');document.getElementById('anatomyBackBtn').classList.toggle('active',activeBodyView==='back');document.querySelector('.body-svg-box').classList.toggle('is-back',activeBodyView==='back');const contours=document.getElementById('femaleFrontContours');if(contours)contours.style.display=activeBodyView==='front'?'':'none';renderAnatomyRegions();updateBodySelectionUI();}
function renderAnatomyRegions(){const host=document.getElementById('anatomyRegionList');if(!host)return;const groups=BODY_REGION_GROUPS[activeBodyView]||[];host.innerHTML=groups.map((group,index)=>`<details class="anatomy-group" ${index===0?'open':''}><summary>${group[currentLang]}</summary><div class="area-list">${group.regions.map(([key,en,vi])=>`<button type="button" class="anatomy-region-chip${selectedBodySubArea===key?' active':''}" data-anatomy-region="${key}" onclick="selectAnatomyRegion('${key}')">${currentLang==='vi'?vi:en}</button>`).join('')}</div></details>`).join('');}
function selectAnatomyRegion(key){const groups=BODY_REGION_GROUPS[activeBodyView]||[];for(const group of groups){const item=group.regions.find(region=>region[0]===key);if(item){selectedBodyRegionLabel={en:item[1],vi:item[2]};selectedBodyArea=group.area;selectedBodySide=activeBodyView;selectedBodySubArea=key;break;}}if(!selectedBodyRegionLabel)return;document.querySelectorAll('.anatomy-region-chip').forEach(b=>b.classList.toggle('active',b.dataset.anatomyRegion===key));document.querySelectorAll('.body-part').forEach(p=>p.classList.remove('selected'));document.getElementById('selectedDisplay').innerText=getSelectedAreaLabel();document.getElementById('btnToCamera').disabled=false;}
function selectBodyPart(el){toggleBodyRegion(el.dataset.area,el.dataset.side||'');}
function getSelectedAreaLabel(lang=currentLang) { if(selectedBodyZones.length)return selectedBodyZones.map(zone=>bodyZoneLabel(zone,lang)).join(' · ');if(selectedBodyRegionLabel)return selectedBodyRegionLabel[lang];if(selectedBodySubArea){if(activeLimbType==='body')return BODY_DETAIL_LABELS[lang][selectedBodySubArea]||selectedBodySubArea;const side=selectedBodySide==='right'?(activeLimbType==='leg'?(lang==='vi'?'Chân phải':'Right leg'):(lang==='vi'?'Tay phải':'Right arm')):(activeLimbType==='leg'?(lang==='vi'?'Chân trái':'Left leg'):(lang==='vi'?'Tay trái':'Left arm'));return `${side} · ${(activeLimbType==='leg'?LEG_DETAIL_LABELS:ARM_DETAIL_LABELS)[lang][selectedBodySubArea]}`;} return AREA_LABELS[lang][selectedBodyArea]||selectedBodyArea; }function selectBodyByName(area) { selectedBodyRegionLabel=null;selectedBodyArea=area;selectedBodySide='';selectedBodySubArea='';document.querySelectorAll('.body-part').forEach(p=>p.classList.remove('selected'));document.querySelectorAll('.area-chip').forEach(c=>c.classList.remove('active'));document.querySelectorAll(`.body-part[data-area="${area}"]`).forEach(p=>p.classList.add('selected'));document.getElementById('selectedDisplay').innerText=getSelectedAreaLabel();document.getElementById('btnToCamera').disabled=false; }
function openArmDetail(side) { openLimbDetail(side,'arm'); }
function openLegDetail(side) { openLimbDetail(side,'leg'); }function mapDisplayedBodySide(svgSide){return activeBodyView==='back'?(svgSide==='left'?'right':'left'):svgSide;}function openMappedArmDetail(svgSide){openArmDetail(mapDisplayedBodySide(svgSide));}function openMappedLegDetail(svgSide){const side=mapDisplayedBodySide(svgSide);activeBodyFocus='';openLimbDetail(side,'leg');}
function findAnatomyRegion(key){for(const side of ['front','back'])for(const group of BODY_REGION_GROUPS[side]){const item=group.regions.find(r=>r[0]===key);if(item)return {key:item[0],en:item[1],vi:item[2],area:group.area,side};}return null;}
function openBodyDetail(region){activeBodyFocus=region;chestViewMode='skin';document.getElementById('chestViewToggle').hidden=region!=='chest';document.getElementById('chestViewToggle').classList.remove('show-note');document.querySelectorAll('[data-chest-view]').forEach(button=>button.classList.toggle('active',button.dataset.chestView==='skin'));selectedBodyRegionLabel={en:BODY_DETAIL_LABELS.en[region],vi:BODY_DETAIL_LABELS.vi[region]};activeLimbType='body';activeArmSide='center';selectedBodyArea=({head:'Head',neck:'Neck',chest:'Chest',abdomen:'Abdomen',back:'Back'}[region]||'Chest');selectedBodySide='center';selectedBodySubArea=region;document.querySelectorAll('.body-part').forEach(p=>p.classList.remove('selected'));document.getElementById('btnArmContinue').disabled=false;document.getElementById('btnToCamera').disabled=false;document.getElementById('armDetailTitle').innerText=BODY_DETAIL_LABELS[currentLang][region]||BODY_DETAIL_LABELS[currentLang].chest;document.getElementById('armDetailHint').innerText=currentLang==='vi'?'Kéo mô hình để xoay; chạm vào vùng để chọn.':'Drag to rotate; tap a body region to select it.';document.getElementById('selectedDisplay').innerText=getSelectedAreaLabel();document.getElementById('armSelectedDisplay').innerText=`${translations[currentLang].selectedRegion}: ${getSelectedAreaLabel()}`;renderLimbOptions();document.querySelectorAll('[data-arm-region]').forEach(b=>b.classList.toggle('active',b.dataset.armRegion===region));document.getElementById('pageTitle').innerText=translations[currentLang].healthCheck;openPage('body-detail');requestAnimationFrame(()=>{if(activeLimbType==='body'&&activeBodyFocus===region)initLimb3D('body','center',region);});}function openLimbDetail(side,type){if(type!=='body')activeBodyFocus='';selectedBodyRegionLabel=null;activeLimbType=type;activeArmSide=side;selectedBodyArea='';selectedBodySide='';selectedBodySubArea='';document.querySelectorAll('.body-part').forEach(p=>p.classList.remove('selected'));document.getElementById('btnArmContinue').disabled=true;document.getElementById('btnToCamera').disabled=true;document.getElementById('armDetailTitle').innerText=type==='arm'?(currentLang==='vi'?(side==='right'?'Tay phải của bạn':'Tay trái của bạn'):(side==='right'?'Your right arm':'Your left arm')):(currentLang==='vi'?(side==='right'?'Chân phải của bạn':'Chân trái của bạn'):(side==='right'?'Your right leg':'Your left leg'));document.getElementById('armDetailHint').innerText=currentLang==='vi'?'Kéo mô hình để xoay; chạm vào vùng cơ thể để chọn.':'Drag to rotate; click a body region to select it.';document.getElementById('selectedDisplay').innerText=translations[currentLang].noAreaSelected;document.getElementById('armSelectedDisplay').innerText=translations[currentLang].chooseArmRegion;renderLimbOptions();document.getElementById('pageTitle').innerText=translations[currentLang].healthCheck;openPage('body-detail');requestAnimationFrame(()=>{if(activeLimbType!==type||activeArmSide!==side)return;initLimb3D(type,side);if(activeBodyView==='back'&&limb3DState){limb3DState.root.rotation.y=Math.PI;limb3DState.render();}});}
function initLimb3D(type,side,bodyRegion=""){const stage=document.getElementById('limb3DStage'),canvas=document.getElementById('limb3DCanvas'),status=document.getElementById('limb3DStatus');if(!stage||!canvas)return;if(!window.THREE){status.innerText=currentLang==='vi'?'Không tải được mô hình 3D. Hãy kiểm tra Internet rồi tải lại trang.':'Could not load the 3D model. Check your Internet connection and reload.';return;}status.innerText='';if(limb3DState?.scene){limb3DState.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});limb3DState=null;}const T=window.THREE,scene=new T.Scene();scene.background=new T.Color(0xffffff);const width=Math.max(stage.clientWidth,220),height=Math.max(stage.clientHeight,420);const camera=new T.PerspectiveCamera(36,width/height,.1,100);camera.position.set(0,0,type==="body"?3.5:8.4);camera.lookAt(0,0,0);const renderer=limb3DRenderer||(limb3DRenderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false}));renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));renderer.setSize(width,height,false);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;scene.add(new T.HemisphereLight(0xf5fbff,0x71859a,2.0));const key=new T.DirectionalLight(0xffffff,2.35);key.position.set(-3.5,5,6);scene.add(key);const fill=new T.DirectionalLight(0xb7e5f6,1);fill.position.set(4,1,4);scene.add(fill);const rim=new T.DirectionalLight(0xffffff,1.4);rim.position.set(0,2,-4);scene.add(rim);const root=new T.Group();root.scale.x=side==='left'?-1:1;scene.add(root);const parts=[],chestSkinMeshes=[],chestOrgans=[],chestSurfaceDetails=[];const geo=new T.SphereGeometry(1,36,28);const baseColor=0xc7d4e0;function addPart(region,pos,scale){const mat=new T.MeshStandardMaterial({color:baseColor,roughness:.48,metalness:.02});const mesh=new T.Mesh(geo,mat);mesh.position.set(...pos);mesh.scale.set(...scale);mesh.userData.region=region;root.add(mesh);parts.push(mesh);}function seam(y,r){const ring=new T.Mesh(new T.TorusGeometry(r,.018,8,40),new T.MeshBasicMaterial({color:0xf7fcff}));ring.rotation.x=Math.PI/2;ring.position.y=y;root.add(ring);}if(type==='arm'){const regionKeys=['upper','elbow','forearm','wrist','hand'];const regionBaseColors={upper:baseColor,elbow:baseColor,forearm:baseColor,wrist:baseColor,hand:baseColor};const materials=regionKeys.map(key=>{const m=new T.MeshStandardMaterial({color:regionBaseColors[key],roughness:.48,metalness:.02});m.userData.baseHex=regionBaseColors[key];return m;});const armProfile=[[2.5,.015,.025,0,0],[2.44,.14,.14,0,0],[2.32,.29,.25,.01,0],[2.16,.40,.33,.025,0],[1.98,.46,.36,.045,-.01],[1.78,.48,.36,.065,-.01],[1.55,.46,.35,.09,0],[1.3,.42,.33,.12,.01],[1.06,.38,.31,.15,.02],[.82,.35,.29,.17,.02],[.6,.33,.28,.19,.015],[.4,.31,.27,.20,.01],[.22,.31,.26,.19,0],[.04,.33,.27,.16,-.01],[-.2,.35,.29,.10,-.02],[-.46,.35,.29,.03,-.02],[-.72,.33,.27,-.04,-.01],[-.98,.29,.24,-.10,0],[-1.2,.25,.21,-.16,.01],[-1.38,.21,.18,-.22,.01],[-1.53,.21,.18,-.27,0],[-1.68,.26,.17,-.32,0],[-1.84,.30,.16,-.38,.015],[-2,.30,.15,-.43,.02],[-2.13,.27,.14,-.47,.015],[-2.23,.22,.12,-.49,.01],[-2.29,.14,.09,-.50,.02],[-2.31,.015,.025,-.50,.02]];function cat(a,b,c,d,t){return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}function buildSurface(profile,keys,regions){const samples=[];for(let i=0;i<profile.length-1;i++){const p0=profile[Math.max(0,i-1)],p1=profile[i],p2=profile[i+1],p3=profile[Math.min(profile.length-1,i+2)];for(let s=0;s<6;s++){const t=s/6;samples.push(p1.map((v,k)=>cat(p0[k],v,p2[k],p3[k],t)));}}samples.push(profile[profile.length-1]);const radial=40,verts=[],indices=[],geometry=new T.BufferGeometry();for(const p of samples){for(let j=0;j<radial;j++){const a=2*Math.PI*j/radial;verts.push(p[3]+p[1]*Math.cos(a),p[0],p[4]+p[2]*Math.sin(a));}}let current=-1,groupStart=0,lastRegion=-1;for(let i=0;i<samples.length-1;i++){const y=(samples[i][0]+samples[i+1][0])/2;let ri=regions.findIndex(r=>y<=r.max&&y>r.min);if(ri<0)ri=regions.length-1;if(lastRegion!==-1&&ri!==lastRegion){if(current!==-1&&indices.length>groupStart)geometry.addGroup(groupStart,indices.length-groupStart,current);groupStart=indices.length;current=-1;lastRegion=ri;continue;}lastRegion=ri;const mat=keys.indexOf(regions[ri].key);if(current!==-1&&mat!==current){geometry.addGroup(groupStart,indices.length-groupStart,current);groupStart=indices.length;}current=mat;for(let j=0;j<radial;j++){const a=i*radial+j,b=i*radial+(j+1)%radial,c=(i+1)*radial+(j+1)%radial,d=(i+1)*radial+j;indices.push(a,b,c,a,c,d);}}if(current>=0)geometry.addGroup(groupStart,indices.length-groupStart,current);geometry.setAttribute('position',new T.Float32BufferAttribute(verts,3));geometry.setIndex(indices);geometry.computeVertexNormals();const mesh=new T.Mesh(geometry,materials);mesh.userData.regionKeys=keys;root.add(mesh);parts.push(mesh);return mesh;}buildSurface(armProfile,regionKeys,[{key:'upper',max:3,min:.30},{key:'elbow',max:.30,min:-.16},{key:'forearm',max:-.16,min:-1.31},{key:'wrist',max:-1.31,min:-1.57},{key:'hand',max:-1.57,min:-4}]);function addFinger(x0,y0,x1,y1,rad,bend=0,depth=0,smoothKnuckles=true,addNail=true,depthScale=.90){const prof=[],n=36;for(let k=0;k<=n;k++){const t=k/n;let r=rad*(.78+.22*(1-t));if(smoothKnuckles)for(const joint of [.34,.66])r*=1+.075*Math.exp(-Math.pow((t-joint)/.055,2));if(t>.86){const u=(t-.86)/.14;r=Math.max(.003,r*Math.sqrt(Math.max(.002,1-u*u)));}const x=x0+(x1-x0)*t+bend*Math.sin(Math.PI*t),z=depth+.045*Math.sin(Math.PI*t);prof.push([y0+(y1-y0)*t,r,r*depthScale,x,z]);}const g=new T.BufferGeometry(),v=[],ix=[],radial=32;for(const p of prof)for(let j=0;j<radial;j++){const a=2*Math.PI*j/radial;v.push(p[3]+p[1]*Math.cos(a),p[0],p[4]+p[2]*Math.sin(a));}for(let k=0;k<prof.length-1;k++)for(let j=0;j<radial;j++){const a=k*radial+j,b=k*radial+(j+1)%radial,c=(k+1)*radial+(j+1)%radial,d=(k+1)*radial+j;ix.push(a,b,c,a,c,d);}g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();const m=new T.Mesh(g,materials[4]);m.userData.region='hand';root.add(m);parts.push(m);if(addNail){const nail=new T.Mesh(new T.SphereGeometry(1,16,12),new T.MeshStandardMaterial({color:0xd8e1e8,roughness:.38}));nail.position.set(x1,y1+.11,depth+.082);nail.scale.set(rad*.48,.055,.008);nail.userData.region='hand';root.add(nail);parts.push(nail);}}addFinger(-.67,-2.03,-.74,-2.61,.054,-.004);addFinger(-.52,-2.04,-.57,-2.68,.057,-.002);addFinger(-.37,-2.04,-.39,-2.70,.058,.003);addFinger(-.22,-2.02,-.18,-2.62,.052,.008);addFinger(-.34,-2.04,-.02,-2.20,.056,.035,0,false,false,1.02);}else if(type==='body'){const region=bodyRegion||activeBodyFocus||'chest',shapeRegion=activeBodyFocus||region;const profiles={head:[[.66,.025,.025,0,0],[.60,.18,.17,0,0],[.44,.31,.26,0,0],[.18,.37,.31,0,0],[-.08,.35,.30,0,0],[-.30,.27,.24,0,0],[-.43,.12,.13,0,0],[-.46,.02,.02,0,0]],neck:[[.62,.13,.13,0,0],[.53,.19,.18,0,0],[.32,.21,.19,0,0],[0,.20,.19,0,0],[-.30,.22,.20,0,0],[-.48,.19,.17,0,0],[-.58,.12,.12,0,0]],chest:[[.94,.10,.10,0,0],[.86,.27,.19,0,0],[.72,.51,.28,0,0],[.53,.67,.34,0,0],[.28,.75,.38,0,0],[0,.77,.39,0,0],[-.24,.71,.36,0,0],[-.48,.60,.32,0,0],[-.68,.44,.26,0,0],[-.82,.20,.15,0,0],[-.86,.035,.035,0,0]],abdomen:[[.66,.08,.08,0,0],[.55,.34,.22,0,0],[.32,.47,.28,0,0],[.02,.51,.30,0,0],[-.28,.49,.29,0,0],[-.52,.42,.26,0,0],[-.68,.28,.19,0,0],[-.74,.06,.06,0,0]],back:[[.70,.08,.08,0,0],[.55,.37,.24,0,0],[.32,.54,.30,0,0],[0,.57,.31,0,0],[-.28,.53,.29,0,0],[-.52,.45,.26,0,0],[-.68,.25,.17,0,0],[-.74,.06,.06,0,0]]};const profile=profiles[shapeRegion]||profiles.chest;const samples=[];function bodyCat(a,b,c,d,t){return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}for(let i=0;i<profile.length-1;i++){const p0=profile[Math.max(0,i-1)],p1=profile[i],p2=profile[i+1],p3=profile[Math.min(profile.length-1,i+2)];for(let q=0;q<8;q++){const t=q/8;samples.push(p1.map((v,k)=>bodyCat(p0[k],v,p2[k],p3[k],t)));}}samples.push(profile[profile.length-1]);const radial=48,verts=[],indices=[],g=new T.BufferGeometry();for(const p of samples)for(let j=0;j<radial;j++){const a=2*Math.PI*j/radial,x=p[3]+p[1]*Math.cos(a),y=p[0];let z=p[4]+p[2]*Math.sin(a);if(shapeRegion==='chest'&&Math.sin(a)>0){const sideBulge=Math.exp(-((Math.abs(x)-.31)**2/.075+(y-.02)**2/.14));const sternumSoftening=Math.exp(-(x*x/.01+(y-.02)**2/.30));z+=.052*sideBulge-.012*sternumSoftening;}verts.push(x,y,z);}let regionKeys=null,regionMaterials=null;if(shapeRegion==='head'||shapeRegion==='abdomen'){regionKeys=shapeRegion==='head'?(activeBodyView==='back'?['back-scalp','back-head']:['front-scalp','front-head']):['front-abdomen','front-waist'];const boundary=shapeRegion==='head' ? .18 : -.18,gap=.04;let current=-1,groupStart=0;for(let i=0;i<samples.length-1;i++){const y=(samples[i][0]+samples[i+1][0])/2;if(Math.abs(y-boundary)<gap){if(current>=0&&indices.length>groupStart)g.addGroup(groupStart,indices.length-groupStart,current);groupStart=indices.length;current=-1;continue;}const materialIndex=y>boundary?0:1;if(current!==materialIndex){if(current>=0&&indices.length>groupStart)g.addGroup(groupStart,indices.length-groupStart,current);groupStart=indices.length;current=materialIndex;}for(let j=0;j<radial;j++){const a=i*radial+j,b=i*radial+(j+1)%radial,c=(i+1)*radial+(j+1)%radial,d=(i+1)*radial+j;indices.push(a,b,c,a,c,d);}}if(current>=0&&indices.length>groupStart)g.addGroup(groupStart,indices.length-groupStart,current);regionMaterials=regionKeys.map(()=>{const m=new T.MeshStandardMaterial({color:baseColor,roughness:.48,metalness:.01});m.userData.baseHex=baseColor;return m;});}else{for(let i=0;i<samples.length-1;i++)for(let j=0;j<radial;j++){const a=i*radial+j,b=i*radial+(j+1)%radial,c=(i+1)*radial+(j+1)%radial,d=(i+1)*radial+j;indices.push(a,b,c,a,c,d);}}g.setAttribute('position',new T.Float32BufferAttribute(verts,3));if(shapeRegion==='chest'){const halfGeometry=(sourceIndices,sideSign)=>{const positions=[],halfIndices=[],mapped=new Map();for(let k=0;k<sourceIndices.length;k+=3){const ia=sourceIndices[k],ib=sourceIndices[k+1],ic=sourceIndices[k+2];const cx=(verts[ia*3]+verts[ib*3]+verts[ic*3])/3;if((cx>=0?1:-1)!==sideSign)continue;for(const sourceIndex of [ia,ib,ic]){let targetIndex=mapped.get(sourceIndex);if(targetIndex===undefined){targetIndex=positions.length/3;mapped.set(sourceIndex,targetIndex);positions.push(verts[sourceIndex*3]+sideSign*.022,verts[sourceIndex*3+1],verts[sourceIndex*3+2]);}halfIndices.push(targetIndex);}}const half=new T.BufferGeometry();half.setAttribute('position',new T.Float32BufferAttribute(positions,3));half.setIndex(halfIndices);half.computeVertexNormals();return half;};[['front-right-breast',1],['front-left-breast',-1]].forEach(([key,sign])=>{const mat=new T.MeshStandardMaterial({color:baseColor,roughness:.48,metalness:.01});mat.userData.baseHex=baseColor;const half=new T.Mesh(halfGeometry(indices,sign),mat);half.userData.region=key;root.add(half);parts.push(half);chestSkinMeshes.push(half);});const addOrgan=(color,pos,scale,rotation=0)=>{const mat=new T.MeshStandardMaterial({color,roughness:.72,metalness:0});const organ=new T.Mesh(new T.SphereGeometry(1,32,24),mat);organ.position.set(...pos);organ.scale.set(...scale);organ.rotation.z=rotation;organ.visible=false;root.add(organ);chestOrgans.push(organ);};addOrgan(0xd99b9c,[.27,.03,.30],[.22,.44,.075],-.08);addOrgan(0xd99b9c,[-.27,.03,.30],[.22,.44,.075],.08);addOrgan(0xb95762,[.08,-.12,.39],[.17,.25,.11],-.16);const surfaceZ=(x,y)=>{let lo=samples[0],hi=samples[samples.length-1];for(let i=0;i<samples.length-1;i++)if(samples[i][0]>=y&&samples[i+1][0]<=y){lo=samples[i];hi=samples[i+1];break;}const t=lo[0]===hi[0]?0:(lo[0]-y)/(lo[0]-hi[0]);const rx=lo[1]+(hi[1]-lo[1])*t,rz=lo[2]+(hi[2]-lo[2])*t,cx=lo[3]+(hi[3]-lo[3])*t,n=Math.max(-.98,Math.min(.98,(x-cx)/rx));const lobe=Math.exp(-((Math.abs(x)-.31)**2/.075+(y-.02)**2/.14)),sternum=Math.exp(-(x*x/.01+(y-.02)**2/.30));return rz*Math.sqrt(Math.max(.02,1-n*n))+.052*lobe-.012*sternum+.012;};const addContour=(coords,color=0xdce5eb,radius=.009)=>{const points=coords.map(([x,y])=>new T.Vector3(x,y,surfaceZ(x,y)));const curve=new T.CatmullRomCurve3(points);const mesh=new T.Mesh(new T.TubeGeometry(curve,32,radius,6,false),new T.MeshStandardMaterial({color,roughness:.82}));root.add(mesh);chestSurfaceDetails.push(mesh);};addContour([[-.62,.55],[-.46,.64],[-.27,.70],[-.10,.67],[0,.63]],0xe2eaf0,.012);addContour([[.62,.55],[.46,.64],[.27,.70],[.10,.67],[0,.63]],0xe2eaf0,.012);addContour([[-.075,.78],[0,.75],[.075,.78]],0x9eacb8,.007);for(const sx of [-1,1]){const ring=new T.Mesh(new T.TorusGeometry(.052,.006,8,32),new T.MeshStandardMaterial({color:0xb5a1a2,roughness:.85}));ring.position.set(sx*.31,-.02,surfaceZ(sx*.31,-.02)+.006);root.add(ring);chestSurfaceDetails.push(ring);const nipple=new T.Mesh(new T.SphereGeometry(1,20,14),new T.MeshStandardMaterial({color:0xb9a6a7,roughness:.75}));nipple.position.set(sx*.31,-.02,surfaceZ(sx*.31,-.02)+.018);nipple.scale.set(.018,.022,.014);root.add(nipple);chestSurfaceDetails.push(nipple);addContour([[sx*.55,-.08],[sx*.63,-.16],[sx*.68,-.23]],0xb9c6d0,.005);addContour([[sx*.57,-.28],[sx*.64,-.36],[sx*.66,-.43]],0xb9c6d0,.005);}}else{g.setIndex(indices);g.computeVertexNormals();if(regionMaterials){const part=new T.Mesh(g,regionMaterials);part.userData.regionKeys=regionKeys;root.add(part);parts.push(part);}else{const material=new T.MeshStandardMaterial({color:baseColor,roughness:.48,metalness:.01});material.userData.baseHex=baseColor;const part=new T.Mesh(g,material);part.userData.region=region;root.add(part);parts.push(part);}}if(shapeRegion==='head'&&activeBodyView==='front'){const addFacePart=(key,pos,scale,color)=>{const mat=new T.MeshStandardMaterial({color,roughness:.62,metalness:0});mat.userData.baseHex=color;const mesh=new T.Mesh(new T.SphereGeometry(1,20,14),mat);mesh.position.set(...pos);mesh.scale.set(...scale);mesh.userData.region=key;root.add(mesh);parts.push(mesh);};for(const x of [-.14,.14]){addFacePart('front-ear',[x*2.45,.08,.015],[.052,.105,.07],0xb8c6d1);addFacePart('front-eye',[x,.105,.285],[.083,.045,.024],0xf2f6f8);addFacePart('front-eye',[x,.105,.307],[.024,.03,.013],0x526b80);}addFacePart('front-nose',[0,-.025,.30],[.043,.105,.045],0xb5c3ce);const mouthPath=new T.CatmullRomCurve3([new T.Vector3(-.085,-.235,.245),new T.Vector3(-.045,-.255,.262),new T.Vector3(0,-.26,.268),new T.Vector3(.045,-.255,.262),new T.Vector3(.085,-.235,.245)]);const mouthMat=new T.MeshStandardMaterial({color:0x718493,roughness:.75});mouthMat.userData.baseHex=0x718493;const mouth=new T.Mesh(new T.TubeGeometry(mouthPath,20,.009,8,false),mouthMat);mouth.userData.region='front-mouth';root.add(mouth);parts.push(mouth);}}else{const legKeys=['thigh','knee','lowerLeg','foot'];const legMaterials=legKeys.map(()=>{const m=new T.MeshStandardMaterial({color:baseColor,roughness:.46,metalness:.01});m.userData.baseHex=baseColor;return m;});const legProfile=[[2.38,.02,.03,0,0],[2.31,.15,.16,0,0],[2.18,.27,.25,0,0],[2.00,.36,.32,0,0],[1.78,.40,.34,0,0],[1.50,.39,.33,0,0],[1.22,.35,.30,0,0],[.94,.31,.27,0,0],[.68,.27,.24,0,0],[.46,.25,.23,0,0],[.28,.24,.22,0,0],[.08,.24,.22,0,0],[-.12,.25,.23,0,0],[-.36,.27,.25,0,0],[-.62,.30,.28,0,0],[-.90,.32,.29,0,0],[-1.15,.29,.26,0,0],[-1.38,.24,.22,0,0],[-1.58,.19,.18,0,0],[-1.76,.17,.17,0,0],[-1.88,.18,.18,0,.01],[-1.97,.26,.22,0,.06],[-2.04,.35,.22,0,.12],[-2.11,.39,.19,0,.18],[-2.17,.34,.16,0,.22],[-2.20,.23,.12,0,.24],[-2.21,.02,.025,0,.24]];const legCat=(a,b,c,d,t)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);const samples=[];for(let i=0;i<legProfile.length-1;i++){const p0=legProfile[Math.max(0,i-1)],p1=legProfile[i],p2=legProfile[i+1],p3=legProfile[Math.min(legProfile.length-1,i+2)];for(let q=0;q<7;q++){const t=q/7;samples.push(p1.map((v,k)=>legCat(p0[k],v,p2[k],p3[k],t)));}}samples.push(legProfile[legProfile.length-1]);const radial=48,verts=[],indices=[],geometry=new T.BufferGeometry();for(const p of samples)for(let j=0;j<radial;j++){const a=2*Math.PI*j/radial,x=p[3]+p[1]*Math.cos(a),y=p[0];let z=p[4]+p[2]*Math.sin(a);if(shapeRegion==='chest'&&Math.sin(a)>0){const sideBulge=Math.exp(-((Math.abs(x)-.31)**2/.075+(y-.02)**2/.14));const sternumSoftening=Math.exp(-(x*x/.01+(y-.02)**2/.30));z+=.052*sideBulge-.012*sternumSoftening;}verts.push(x,y,z);}let currentMaterial=-1,groupStart=0,lastRegion=-1;for(let i=0;i<samples.length-1;i++){const y=(samples[i][0]+samples[i+1][0])/2;const ri=y>.28?0:y>-.12?1:y>-1.88?2:3;if(lastRegion!==-1&&ri!==lastRegion){if(currentMaterial>=0&&indices.length>groupStart)geometry.addGroup(groupStart,indices.length-groupStart,currentMaterial);groupStart=indices.length;currentMaterial=-1;lastRegion=ri;continue;}if(Math.min(Math.abs(y-.28),Math.abs(y+.12),Math.abs(y+1.88))<.04){if(currentMaterial>=0&&indices.length>groupStart)geometry.addGroup(groupStart,indices.length-groupStart,currentMaterial);groupStart=indices.length;currentMaterial=-1;lastRegion=ri;continue;}lastRegion=ri;if(currentMaterial!==ri){if(currentMaterial>=0&&indices.length>groupStart)geometry.addGroup(groupStart,indices.length-groupStart,currentMaterial);groupStart=indices.length;}currentMaterial=ri;for(let j=0;j<radial;j++){const a=i*radial+j,b=i*radial+(j+1)%radial,c=(i+1)*radial+(j+1)%radial,d=(i+1)*radial+j;indices.push(a,b,c,a,c,d);}}if(currentMaterial>=0&&indices.length>groupStart)geometry.addGroup(groupStart,indices.length-groupStart,currentMaterial);geometry.setAttribute('position',new T.Float32BufferAttribute(verts,3));geometry.setIndex(indices);geometry.computeVertexNormals();const legMesh=new T.Mesh(geometry,legMaterials);legMesh.userData.regionKeys=legKeys;root.add(legMesh);parts.push(legMesh);}const raycaster=new T.Raycaster(),pointer=new T.Vector2();function render(){renderer.render(scene,camera);}function applyChestView(){const inside=type==='body'&&activeBodyFocus==='chest'&&chestViewMode==='inside';chestSkinMeshes.forEach(mesh=>{mesh.material.transparent=inside;mesh.material.opacity=inside?.22:1;mesh.material.depthWrite=!inside;mesh.material.needsUpdate=true;});chestOrgans.forEach(mesh=>mesh.visible=inside);chestSurfaceDetails.forEach(mesh=>mesh.visible=!inside);}function syncSelection(region){parts.forEach(mesh=>{if(Array.isArray(mesh.material)){mesh.material.forEach((mat,index)=>{const key=mesh.userData.regionKeys[index];const on=key===region||(region==='front-chest'&&(mesh.userData.regionKeys.includes(key)||mesh.userData.region==='front-left-breast'||mesh.userData.region==='front-right-breast'));mat.color.set(on?0x49b9df:(mat.userData.baseHex||baseColor));mat.emissive.set(on?0x087ca6:0x000000);mat.emissiveIntensity=on?.2:0;});}else{const on=mesh.userData.region===region||(region==='front-chest'&&(mesh.userData.region==='front-left-breast'||mesh.userData.region==='front-right-breast'));mesh.material.color.set(on?0x49b9df:(mesh.material.userData.baseHex||baseColor));mesh.material.emissive.set(on?0x087ca6:0x000000);mesh.material.emissiveIntensity=on?.2:0;}});applyChestView();render();}function chooseAt(ev){const r=canvas.getBoundingClientRect();pointer.x=(ev.clientX-r.left)/r.width*2-1;pointer.y=-(ev.clientY-r.top)/r.height*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(parts,false)[0];if(hit){const region=hit.object.userData.region||(hit.face&&hit.object.userData.regionKeys?hit.object.userData.regionKeys[hit.face.materialIndex]:null);if(!region)return;const cat=type==='body'?({head:'Head',neck:'Neck',chest:'Chest',abdomen:'Abdomen',back:'Back'}[activeBodyFocus]||'Chest'):type==='leg'?'Leg':region==='elbow'?'Elbow':['wrist','hand'].includes(region)?'Hand':'Arm';selectArmDetailArea(region,cat);}}let drag=null;canvas.onpointerdown=ev=>{drag={x:ev.clientX,y:ev.clientY,moved:false};canvas.setPointerCapture(ev.pointerId);};canvas.onpointermove=ev=>{if(!drag)return;const dx=ev.clientX-drag.x,dy=ev.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=true;root.rotation.y+=dx*.012;root.rotation.x=Math.max(-.8,Math.min(.8,root.rotation.x+dy*.008));drag.x=ev.clientX;drag.y=ev.clientY;render();};canvas.onpointerup=ev=>{if(drag&&!drag.moved)chooseAt(ev);drag=null;};canvas.onpointercancel=()=>drag=null;limb3DState={renderer,scene,camera,root,parts,syncSelection,render,type,side,applyChestView};if(type==='body'&&bodyRegion)syncSelection(bodyRegion==='head'?(activeBodyView==='back'?'back-scalp':'front-scalp'):bodyRegion==='abdomen'?'front-abdomen':bodyRegion);else{applyChestView();render();}}let chestViewMode='skin';function setChestView(mode){chestViewMode=mode==='inside'?'inside':'skin';const toggle=document.getElementById('chestViewToggle');if(toggle){toggle.classList.toggle('show-note',chestViewMode==='inside');toggle.querySelectorAll('[data-chest-view]').forEach(button=>button.classList.toggle('active',button.dataset.chestView===chestViewMode));}if(limb3DState?.type==='body'){limb3DState.applyChestView();limb3DState.render();}}function renderLimbOptions(){const isLeg=activeLimbType==='leg',isBody=activeLimbType==='body';if(isBody){const keys=(BODY_FOCUS_KEYS[activeBodyView]||{})[activeBodyFocus]||[];document.getElementById('armDetailOptions').innerHTML=keys.map(key=>{const item=findAnatomyRegion(key);if(!item)return '';return `<button class="area-chip" data-arm-region="${key}" onclick="selectArmDetailArea('${key}','${item.area}')">${currentLang==='vi'?item.vi:item.en}</button>`;}).join('');return;}const items=isLeg?LEG_DETAIL_LABELS[currentLang]:ARM_DETAIL_LABELS[currentLang];document.getElementById('armDetailOptions').innerHTML=Object.entries(items).map(([key,label])=>{const category=isLeg?'Leg':key==='elbow'?'Elbow':['wrist','hand'].includes(key)?'Hand':'Arm';return `<button class="area-chip" data-arm-region="${key}" onclick="selectArmDetailArea('${key}','${category}')">${label}</button>`;}).join('');}function selectArmDetailArea(region,category){selectedBodyArea=category;selectedBodySide=activeArmSide;selectedBodySubArea=region;document.querySelectorAll('.arm-detail-part').forEach(p=>p.classList.toggle('selected',p.dataset.region===region));document.querySelectorAll('[data-arm-region]').forEach(b=>b.classList.toggle('active',b.dataset.armRegion===region));if(activeLimbType==='body'){const item=findAnatomyRegion(region);if(item){selectedBodyRegionLabel={en:item.en,vi:item.vi};selectedBodyArea=item.area;selectedBodySide=item.side;}else selectedBodyRegionLabel={en:BODY_DETAIL_LABELS.en[region]||region,vi:BODY_DETAIL_LABELS.vi[region]||region};document.getElementById('armDetailTitle').innerText=getSelectedAreaLabel();document.getElementById('armSelectedDisplay').innerText=`${translations[currentLang].selectedRegion}: ${getSelectedAreaLabel()}`;initLimb3D('body','center',region);}else{document.getElementById('armSelectedDisplay').innerText=`${translations[currentLang].selectedRegion}: ${getSelectedAreaLabel()}`;document.getElementById('selectedDisplay').innerText=getSelectedAreaLabel();if(limb3DState)limb3DState.syncSelection(region);}document.getElementById('selectedDisplay').innerText=getSelectedAreaLabel();document.getElementById('btnArmContinue').disabled=false;document.getElementById('btnToCamera').disabled=false;}function backToBodyMap(){openPage('health-check');}
function goToCamera(){if(!selectedBodyArea)return;openPage('camera');}

async function openCamera() {
  stopCamera();
  const errBox = document.getElementById('cameraErrorBox');
  if (errBox) errBox.style.display = 'none';
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: currentFacingMode } },
      audio: false
    });
    const video = document.getElementById('cameraVideo');
    video.srcObject = mediaStream;
    video.style.transform = currentFacingMode === 'user' ? 'scaleX(-1)' : 'none';
    document.getElementById('cameraBox').classList.add('camera-active');
    document.getElementById('cameraBox').classList.remove('has-image');
    document.getElementById('cameraPlaceholder').style.display = 'none';
    document.getElementById('cameraButton').style.display = 'none';
    document.getElementById('stopCameraButton').style.display = 'inline-flex';
    document.getElementById('switchCameraBtn').style.display = 'inline-flex';
    document.getElementById('cameraStatus').innerText =
      currentLang === 'vi' ? 'Camera đang hoạt động.' : 'Camera is active.';
  } catch (e) {
    const msg = currentLang === 'vi'
      ? 'Không mở được camera. Kiểm tra quyền trình duyệt hoặc dùng “Tải ảnh lên”.'
      : 'Cannot open camera. Check browser permission or use Upload Photo.';
    document.getElementById('cameraStatus').innerText = msg;
    if (errBox) {
      document.getElementById('cameraErrorText').innerText = msg;
      errBox.style.display = 'block';
    }
  }
}
function dismissCameraError() {
  const errBox = document.getElementById('cameraErrorBox');
  if (errBox) errBox.style.display = 'none';
  document.getElementById('cameraStatus').innerText =
    currentLang === 'vi' ? 'Đã bỏ qua camera. Có thể tải ảnh hoặc Continues.' : 'Camera skipped. You can upload a photo or Continue.';
}
function switchCamera() { currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'; openCamera(); }
function stopCamera() {
  if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
  document.getElementById('cameraVideo').srcObject = null;
  document.getElementById('cameraBox').classList.remove('camera-active');
  document.getElementById('cameraPlaceholder').style.display = 'block';
  document.getElementById('cameraButton').style.display = 'inline-flex';
  document.getElementById('stopCameraButton').style.display = 'none';
  document.getElementById('switchCameraBtn').style.display = 'none';
  const errBox = document.getElementById('cameraErrorBox');
  if (errBox) errBox.style.display = 'none';
  document.getElementById('cameraStatus').innerText = translations[currentLang].cameraStatusOff;
}
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    document.getElementById('cameraStatus').innerText =
      currentLang === 'vi' ? 'File không phải ảnh. Chọn lại.' : 'Not an image file. Please choose again.';
    return;
  }
  stopCamera();
  const reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('uploadedImage').src = ev.target.result;
    document.getElementById('cameraBox').classList.add('has-image');
    document.getElementById('cameraPlaceholder').style.display = 'none';
    document.getElementById('cameraStatus').innerText = currentLang === 'vi' ? 'Đã tải ảnh lên.' : 'Photo uploaded.';
  };
  reader.readAsDataURL(file);
}

function goToAIChat() {
  stopCamera();
  openPage('ai-chat');
  document.getElementById('aiChatMessages').innerHTML = '';
  document.getElementById('quickReplies').innerHTML = '';
  aiChatStep = 0; aiAnswers = []; aiFinished = false;
  setResultBtn(false);
  setTimeout(() => askNextAIQuestion(), 500);
}
function showTypingThen(callback) {
  const messages = document.getElementById('aiChatMessages');
  const typing = document.createElement('div');
  typing.className = 'ai-msg bot';
  typing.id = 'typingIndicator';
  typing.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  messages.appendChild(typing);
  messages.scrollTop = 9999;
  setTimeout(() => {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
    callback();
  }, 600);
}
function askNextAIQuestion() {
  showTypingThen(() => {
    const areaLabel = getSelectedAreaLabel();
    const q = AI_QUESTIONS[currentLang][aiChatStep].replace('{area}', areaLabel);
    const botMsg = document.createElement('div');
    botMsg.className = 'ai-msg bot';
    botMsg.innerHTML = q;
    document.getElementById('aiChatMessages').appendChild(botMsg);
    document.getElementById('aiChatMessages').scrollTop = 9999;
    const quick = document.getElementById('quickReplies');
    quick.innerHTML = '';
    if (aiChatStep < 4) {
      (QUICK_OPTIONS[currentLang][aiChatStep] || []).forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quick-reply';
        btn.innerText = opt;
        btn.onclick = () => answerWithQuick(opt);
        quick.appendChild(btn);
      });
    } else {
      aiFinished = true;
      setResultBtn(true);
    }
  });
}
function answerWithQuick(text) {
  addUserMessage(text); aiAnswers.push(text);
  document.getElementById('quickReplies').innerHTML = '';
  aiChatStep++;
  saveHealthCheckDraft('ai-chat');
  if (aiChatStep < AI_QUESTIONS[currentLang].length) setTimeout(() => askNextAIQuestion(), 300);
}
function sendAIChatMessage() {
  const input = document.getElementById('aiChatInput');
  const text = input.value.trim();
  if (!text || aiFinished) return;
  addUserMessage(text); aiAnswers.push(text); input.value = '';
  document.getElementById('quickReplies').innerHTML = '';
  aiChatStep++;
  saveHealthCheckDraft('ai-chat');
  if (aiChatStep < AI_QUESTIONS[currentLang].length) setTimeout(() => askNextAIQuestion(), 300);
  else { aiFinished = true; setResultBtn(true); }
}
function addUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'ai-msg user';
  msg.innerText = text;
  document.getElementById('aiChatMessages').appendChild(msg);
  document.getElementById('aiChatMessages').scrollTop = 9999;
}

function goToResult(apiResponse) {
  const areaLabel = getSelectedAreaLabel();
  // Mock condition by body area (later: from API / Exora + DB)
  const conditionByArea = {
    en: {
      Head: "Tension headache / Migraine (possible)",
      Neck: "Muscle strain (neck)",
      Chest: "Muscle strain / Mild respiratory irritation (possible)",
      Abdomen: "Indigestion / Gastritis (possible)",
      Back: "Muscle strain (back)",
      Arm: "Muscle strain / Overuse (arm)",
      Elbow: "Tendon irritation (elbow)",
      Hand: "Local irritation / Strain (hand)",
      Leg: "Muscle strain / Fatigue (leg)",
      Skin: "Mild skin irritation / Allergy (possible)"
    },
    vi: {
      Head: "Đau đầu căng thẳng / Đau nửa đầu (có thể)",
      Neck: "Căng cơ vùng cổ",
      Chest: "Căng cơ / Kích ứng hô hấp nhẹ (có thể)",
      Abdomen: "Khó tiêu / Viêm dạ dày nhẹ (có thể)",
      Back: "Căng cơ vùng lưng",
      Arm: "Căng cơ / Quá tải (cánh tay)",
      Elbow: "Kích ứng gân (khủy tay)",
      Hand: "Kích ứng / Căng tại bàn tay",
      Leg: "Căng cơ / Mỏi (chân)",
      Skin: "Kích ứng da nhẹ / Dị ứng (có thể)"
    }
  };
  const diseaseName = (conditionByArea[currentLang] && conditionByArea[currentLang][selectedBodyArea])
    || (currentLang === 'vi' ? "Tình trạng phổ biến (tham khảo)" : "Common condition (reference)");

  const aiResult = {
    disease_name: diseaseName,
    explanation: currentLang === 'vi'
      ? "Dựa trên vùng cơ thể và câu trả lời của bạn, các dấu hiệu có thể phù hợp với tình trạng trên. Nên theo dõi thêm 1–2 ngày."
      : "Based on the body area and your answers, signs may match the condition above. Monitor for 1–2 more days.",
    supporting_factors: currentLang === 'vi'
      ? [
          "Vùng cơ thể được chọn: " + areaLabel,
          "Câu trả lời phỏng vấn: " + (aiAnswers.length ? aiAnswers.slice(0, 3).join('; ') : 'chưa đủ'),
          "Khớp mô tả phổ biến cho vùng này",
          skippedProfile ? "Chưa có hồ sơ cá nhân (độ tin cậy thấp hơn)" : "Đã có hồ sơ cá nhân hỗ trợ"
        ]
      : [
          "Selected body area: " + areaLabel,
          "Interview answers: " + (aiAnswers.length ? aiAnswers.slice(0, 3).join('; ') : 'limited'),
          "Matches common descriptions for this area",
          skippedProfile ? "No profile filled (lower confidence)" : "Profile available for context"
        ],
    uncertainty: currentLang === 'vi'
      ? "Nếu triệu chứng nặng hơn hoặc bạn lo lắng, hãy đi khám."
      : "If symptoms worsen or you are worried, please see a doctor.",
    recommended_action: currentLang === 'vi'
      ? "Theo dõi 24–48 giờ. Nghỉ ngơi, uống đủ nước. Đi khám nếu triệu chứng nặng hơn."
      : "Monitor 24–48 hours. Rest and hydrate. See a doctor if symptoms get worse.",
    warning_signs: currentLang === 'vi'
      ? ["Khó thở nặng", "Đau ngực dữ dội", "Ngất hoặc mất ý thức"]
      : ["Severe shortness of breath", "Severe chest pain", "Fainting or loss of consciousness"],
    emergency_facilities: []
  };

  const incoming = apiResponse && typeof apiResponse === 'object' ? apiResponse : aiResult;
  const responseData = incoming.data && typeof incoming.data === 'object' ? incoming.data : incoming;
  const responseStatus = String(incoming.status ?? responseData.status ?? '').toLowerCase();
  const errorValue = incoming.error ?? responseData.error;
  const httpStatus = Number(incoming.status ?? responseData.status);
  if (errorValue || incoming.ok === false || responseData.ok === false || ['error','failed','failure'].includes(responseStatus) || (Number.isFinite(httpStatus) && httpStatus >= 400)) {
    const errorMessage = typeof errorValue === 'string' ? errorValue : (errorValue?.message || responseData.message || incoming.message);
    renderResultError(errorMessage || (currentLang === 'vi'
      ? 'Chưa thể tải kết quả kiểm tra. Vui lòng thử lại.'
      : 'The check result could not be loaded. Please try again.'));
    document.getElementById('resultBody').innerText = areaLabel;
    document.getElementById('resultAnswers').innerText = aiAnswers.join(' · ') || '—';
    showResultMain(); setCheckActive(false); openPage('results'); return;
  }
  const result = apiResponse && typeof apiResponse === 'object' ? (responseData.result && typeof responseData.result === 'object' ? responseData.result : responseData) : aiResult;

  const resultStatus = String(result.status || responseStatus || '').toLowerCase();
  const confidenceLevel = String(result.confidence_level || result.confidence || '').toLowerCase();
  const isUncertain = ['uncertain', 'low_confidence', 'low-confidence', 'low confidence'].includes(resultStatus) || result.uncertain === true || ['uncertain', 'low', 'low_confidence', 'low-confidence'].includes(confidenceLevel);
  const isIncomplete = resultStatus === 'incomplete' || !String(result.disease_name || '').trim() || !String(result.explanation || '').trim() || !String(result.recommended_action || '').trim();

  const setResultList = (id, values, fallback) => {
    const list = document.getElementById(id); if (!list) return;
    list.replaceChildren();
    const items = (Array.isArray(values) ? values : (typeof values === 'string' ? [values] : [])).filter(v => typeof v === 'string' && v.trim());
    (items.length ? items : [fallback]).forEach(value => {
      const li = document.createElement('li'); li.textContent = value; list.appendChild(li);
    });
  };
  const noData = currentLang === 'vi' ? 'Chưa có thông tin trong phản hồi.' : 'No information was provided.';
  document.getElementById('resultDiseaseName').textContent = result.disease_name ||
    (currentLang === 'vi' ? 'Chưa đủ thông tin để gợi ý tình trạng' : 'Not enough information for a suggestion');
  document.getElementById('resultExplanation').textContent = result.explanation ||
    (currentLang === 'vi' ? 'Một số thông tin trả về còn thiếu. Vui lòng thử lại hoặc hoàn tất câu hỏi để xem kết quả.' : 'Some response information is missing. Please try again or complete the questions to view a result.');
  document.getElementById('resultAction').textContent = result.recommended_action ||
    (currentLang === 'vi' ? 'Nếu triệu chứng nghiêm trọng hoặc xấu đi, hãy liên hệ cơ sở y tế.' : 'If symptoms are severe or getting worse, contact a health professional.');
  document.getElementById('resultActionShort').textContent = document.getElementById('resultAction').textContent;
  setResultList('resultWarnings', result.warning_signs, noData);
  setResultList('resultWhyChips', result.supporting_factors, noData);
  setResultList('resultWhyChipsDetail', result.supporting_factors, noData);
  const noteEl = document.querySelector('.result-disease-note');
  if (noteEl) {
    const caution = result.uncertainty || (isUncertain
      ? (currentLang === 'vi' ? 'Kết quả chưa chắc chắn, chỉ nên xem là thông tin tham khảo.' : 'This result is uncertain and should be treated as informational only.')
      : '');
    noteEl.textContent = isIncomplete
      ? (currentLang === 'vi' ? 'Phản hồi chưa đầy đủ. ' : 'The response is incomplete. ') + caution
      : caution;
    noteEl.style.display = (isIncomplete || caution) ? 'block' : 'none';
  }

  // Keep the caution inline with the result; do not interrupt with toast reminders.
  hideResultToasts();

  const facCard = document.getElementById('facilitiesCard');
  const facBox = document.getElementById('resultFacilities');
  const facilities = Array.isArray(result.emergency_facilities) ? result.emergency_facilities.filter(f => f && typeof f === 'object') : [];
  facBox.replaceChildren();
  if (facilities.length) {
    facCard.style.display = 'block';
    facilities.forEach(f => {
      const row = document.createElement('div'); row.className = 'result-facility';
      const icon = document.createElement('div'); icon.className = 'result-facility-icon';
      icon.innerHTML = '<svg class="ui-icon"><use href="#i-hospital"></use></svg>';
      const info = document.createElement('div'); const name = document.createElement('strong'); name.textContent = f.name || '';
      const details = document.createElement('small');
      details.textContent = [f.address, f.distance || (f.distance_km ? f.distance_km + ' km' : '')].filter(Boolean).join(' · ');
      info.append(name, details);
      if (f.phone) { const phone = document.createElement('a'); phone.href = 'tel:' + String(f.phone).replace(/[^\d+]/g, ''); phone.textContent = String(f.phone); phone.style.cssText = 'display:inline-block;margin-top:4px;color:var(--green-dark);font-weight:700'; info.appendChild(phone); }
      row.append(icon, info); facBox.appendChild(row);
    });
  } else {
    facCard.style.display = 'none';
    facBox.innerHTML = '';
  }

  document.getElementById('resultBody').innerText = areaLabel;
  document.getElementById('resultAnswers').innerText = aiAnswers.join(' · ') || '—';
  showResultMain();
  setCheckActive(false);
  try { sessionStorage.removeItem(HEALTH_CHECK_DRAFT_KEY); } catch (e) {}
  openPage('results');
}

function renderResultError(message) {
  document.getElementById('resultDiseaseName').textContent = currentLang === 'vi' ? 'Không tải được kết quả' : 'Result unavailable';
  document.getElementById('resultExplanation').textContent = message;
  const retry = currentLang === 'vi' ? 'Bạn có thể quay lại và thử gửi lại câu trả lời.' : 'You can go back and submit your answers again.';
  document.getElementById('resultAction').textContent = retry;
  document.getElementById('resultActionShort').textContent = retry;
  const note = document.querySelector('.result-disease-note');
  if (note) { note.textContent = currentLang === 'vi' ? 'Đã xảy ra lỗi kết nối' : 'A connection error occurred'; note.style.display = 'block'; }
  ['resultWarnings', 'resultWhyChips', 'resultWhyChipsDetail'].forEach(id => document.getElementById(id)?.replaceChildren());
  document.getElementById('facilitiesCard').style.display = 'none';
  hideResultToasts();
}

function dismissToast(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}
function hideResultToasts() {
  dismissToast('toastStatus');
  dismissToast('toastNotice');
}
function showResultToasts(isEmergency, noticeText) {
  const status = document.getElementById('toastStatus');
  const notice = document.getElementById('toastNotice');
  document.getElementById('toastStatusIcon').innerHTML = isEmergency ? '<svg class="ui-icon"><use href="#i-alert"></use></svg>' : '<svg class="ui-icon"><use href="#i-book"></use></svg>';
  document.getElementById('toastStatusTitle').innerText = isEmergency
    ? translations[currentLang].resultStatusUrgent
    : translations[currentLang].resultStatusRef;
  document.getElementById('toastStatusSub').innerText = translations[currentLang].resultsSub;
  status.className = 'toast-card status show' + (isEmergency ? ' emergency' : '');
  document.getElementById('toastNoticeText').innerText = noticeText || '';
  notice.classList.add('show');
}
function showResultMain() {
  document.getElementById('resultViewMain').classList.add('active');
  document.getElementById('resultViewDetail').classList.remove('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function showResultDetail() {
  document.getElementById('resultViewMain').classList.remove('active');
  document.getElementById('resultViewDetail').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderDiseaseGrid() {
  document.getElementById('diseaseGrid').innerHTML = DISEASES.map(d => {
    const t = d[currentLang];
    return `<div class="card disease-card" onclick="openDiseaseDetail('${d.id}')"><h3>${t.name}</h3><p class="muted">${t.desc}</p><span class="disease-tag">${TAG_I18N[currentLang][d.tag]}</span></div>`;
  }).join('');
  const empty = document.getElementById('diseaseEmpty');
  if (empty) empty.style.display = 'none';
}
function filterDiseases() {
  const q = (document.getElementById('diseaseSearchInput').value || '').toLowerCase().trim();
  let shown = 0;
  document.querySelectorAll('#diseaseGrid .disease-card').forEach(card => {
    const ok = !q || card.textContent.toLowerCase().includes(q);
    card.style.display = ok ? 'block' : 'none';
    if (ok) shown++;
  });
  const empty = document.getElementById('diseaseEmpty');
  if (empty) empty.style.display = shown === 0 ? 'block' : 'none';
}
function openDiseaseDetail(id) {
  const d = DISEASES.find(x => x.id === id);
  if (!d) return;
  const detail = document.getElementById('diseaseDetailCard');
  if (!detail._returnParent) { detail._returnParent = detail.parentNode; detail._returnNext = detail.nextSibling; }
  document.getElementById('detailTitle').textContent = d[currentLang].name;
  document.getElementById('detailContent').textContent = d[currentLang].detail;
  document.body.appendChild(detail);
  detail.style.display = 'block'; detail.classList.add('disease-detail-modal'); detail.focus({ preventScroll: true });
  document.body.style.overflow = 'hidden';
}
function closeDiseaseDetail() {
  const detail = document.getElementById('diseaseDetailCard');
  detail.style.display = 'none'; detail.classList.remove('disease-detail-modal');
  document.body.style.overflow = '';
  if (detail._returnParent) detail._returnParent.insertBefore(detail, detail._returnNext);
}
function renderHistory() {
  document.getElementById('historyList').innerHTML = HISTORY_DATA.map(h => {
    const t = h[currentLang];
    return `<div class="history-item"><div><strong>${t.date}</strong><p class="muted" style="margin:3px 0 0;font-size:13px">${t.note}</p></div><span class="history-badge">${t.badge}</span></div>`;
  }).join('');
}
function openLesson(id) {
  const lesson = LESSONS[id];
  if (!lesson || !lesson[currentLang]) return;
  const detail = document.getElementById('lessonDetail');
  if (!detail.dataset.returnParent) {
    detail.dataset.returnParent = 'true';
    detail._lessonParent = detail.parentNode;
    detail._lessonNext = detail.nextSibling;
  }
  document.getElementById('lessonContent').innerHTML = lesson[currentLang];
  document.body.appendChild(detail);
  detail.setAttribute('role', 'dialog');
  detail.setAttribute('aria-modal', 'true');
  detail.classList.add('show');
  document.body.style.overflow = 'hidden';
  detail.scrollTop = 0;
  detail.focus({ preventScroll: true });
}
function closeLesson() {
  const detail = document.getElementById('lessonDetail');
  detail.classList.remove('show');
  detail.removeAttribute('aria-modal');
  document.body.style.overflow = '';
  if (detail._lessonParent) detail._lessonParent.insertBefore(detail, detail._lessonNext);
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.getElementById('lessonDetail')?.classList.contains('show')) closeLesson();
  if (event.key === 'Escape' && document.getElementById('diseaseDetailCard')?.classList.contains('disease-detail-modal')) closeDiseaseDetail();
});
function requestLocation() {
  document.getElementById('locationStatus').innerText = currentLang === 'vi' ? 'Đang lấy vị trí...' : 'Getting location...';
}
function openEmergency() {
  document.getElementById('emSelectView').style.display = 'block';
  document.getElementById('emDetailView').classList.remove('show');
  openPage('emergency');
}
function openEmGuide(type) {
  document.getElementById('emGuideContent').innerHTML = EM_GUIDES[type][currentLang];
  document.getElementById('emSelectView').style.display = 'none';
  document.getElementById('emDetailView').classList.add('show');
}
function backToEmSelect() {
  document.getElementById('emDetailView').classList.remove('show');
  document.getElementById('emSelectView').style.display = 'block';
}
function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    document.getElementById('avatarPreview').innerHTML = `<img src="${ev.target.result}"><input type="file" accept="image/*" onchange="handleAvatarUpload(event)">`;
    document.getElementById('topAvatar').innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover">`;
  };
  reader.readAsDataURL(file);
}
function validateProfile() {
  const name = document.getElementById('profileName').value.trim();
  const age = document.getElementById('profileAge').value.trim();
  let valid = true;
  if (!name) { document.getElementById('profileName').classList.add('error'); document.getElementById('nameError').classList.add('show'); valid = false; }
  else { document.getElementById('profileName').classList.remove('error'); document.getElementById('nameError').classList.remove('show'); }
  const ageNum = Number(age);
  if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) { document.getElementById('profileAge').classList.add('error'); document.getElementById('ageError').classList.add('show'); valid = false; }
  else { document.getElementById('profileAge').classList.remove('error'); document.getElementById('ageError').classList.remove('show'); }
  document.getElementById('btnSaveProfile').disabled = !valid;
  return valid;
}
function saveProfile() {
  if (!validateProfile()) return;
  const name = document.getElementById('profileName').value.trim();
  isProfileCompleted = true; skippedProfile = false;
  document.getElementById('topUserName').innerText = name;
  if (!document.getElementById('topAvatar').querySelector('img')) document.getElementById('topAvatar').innerText = name.charAt(0).toUpperCase();
  showMessage(currentLang === 'vi' ? 'Thành công' : 'Success', translations[currentLang].profileSaved);
}

renderDiseaseGrid();
renderHistory();
document.getElementById('aiChatInput').addEventListener('keypress', e => { if (e.key === 'Enter') sendAIChatMessage(); });
changeLanguage('vi');
window.addEventListener('beforeunload', () => saveHealthCheckDraft());
showHealthCheckResumePrompt();


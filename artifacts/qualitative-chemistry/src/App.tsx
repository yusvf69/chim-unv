import { type DragEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import sourceBook from './content/book-source.html?raw';
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUp,
  Atom,
  Beaker,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Menu,
  Microscope,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  TestTube2,
  Undo2,
  Video,
  X,
} from 'lucide-react';

type StudyItem = { n: string; q: string; r: string; a: string };
type Term = [string, string];
type QuizItem = { q: string; o: string[]; c: number; e: string };
type LabStep = { t: string; o: string; i: string };
type Lab = Record<string, LabStep[]>;

function readSource<T>(name: string): T {
  const match = sourceBook.match(new RegExp(`const ${name} = ([\\s\\S]*?);\\s*(?:const |function |</script>)`));
  if (!match) return [] as T;
  return new Function(`return (${match[1]})`)() as T;
}

const essay = readSource<StudyItem[]>('essay');
const mcq = readSource<StudyItem[]>('mcq');
const terms = readSource<Term[]>('terms');
const quizItems = readSource<QuizItem[]>('quiz');
const labs = readSource<Lab>('labs');

const chapterLinks = [
  ['home', 'الرئيسية'],
  ['c1', 'قواعد الثبات'],
  ['c2', 'حمض الكبريتيك'],
  ['c3', 'كلوريد الباريوم'],
  ['c4', 'نترات الفضة'],
  ['c5', 'الأكسدة والاختزال'],
  ['c6', 'الأفكار العليا'],
  ['golden', 'الورقة الذهبية'],
  ['bank', 'بنك المصدر'],
  ['practice', 'تدريب الاختيار'],
  ['quiz', 'الاختبار الأصلي'],
  ['workshop', 'ورشة المختبر'],
  ['video', 'شرح الفيديو'],
];

type PracticeItem = { q: string; o: string[]; c: number; e: string };
const practiceQuestions: PracticeItem[] = [
  { q: 'أضيف BaCl₂ إلى محلول مجهول فتكوّن راسب أبيض. ما الخطوة التي تميّز الفوسفات عن الكبريتات؟', o: ['إضافة HCl مخفف إلى الراسب', 'إضافة النشادر المركز', 'تسخين الراسب حتى الاحمرار'], c: 0, e: 'فوسفات الباريوم تذوب في الحمض المخفف، بينما BaSO₄ لا يذوب؛ لذلك يحدد اختفاء الراسب الفوسفات.' },
  { q: 'راسب أبيض مع BaCl₂ بقي كما هو بعد إضافة HCl المخفف. ما الأنيون الأرجح؟', o: ['PO₄³⁻', 'SO₄²⁻', 'Cl⁻'], c: 1, e: 'عدم الذوبان هو علامة BaSO₄؛ أما Ba₃(PO₄)₂ فيذوب في HCl المخفف.' },
  { q: 'راسب نترات فضة أبيض ذاب بسرعة في النشادر. ما الأيون الذي تؤيده المشاهدة؟', o: ['Cl⁻', 'Br⁻', 'I⁻'], c: 0, e: 'يتكوّن AgCl الأبيض ويذوب سريعًا في النشادر؛ AgBr يذوب ببطء وAgI لا يذوب.' },
  { q: 'راسب أصفر من AgNO₃ لا يذوب في النشادر المركز. ما الاستنتاج؟', o: ['فوسفات', 'يوديد', 'كلوريد'], c: 1, e: 'AgI أصفر وغير ذائب في النشادر؛ الفوسفات الفضي الأصفر يذوب في النشادر.' },
  { q: 'أي نتيجة تؤكد النترات في اختبار الحلقة البنية؟', o: ['حلقة بنية عند الحد الفاصل', 'راسب أبيض يذوب', 'غاز عديم اللون يعكر ماء الجير'], c: 0, e: 'مع FeSO₄ حديث وحمض مركز تتكون الحلقة البنية عند السطح الفاصل بسبب معقد النيتروسيل الحديدي.' },
  { q: 'لماذا لا نرج أنبوبة الحلقة البنية قبل قراءة النتيجة؟', o: ['لأن الرج يزيل الحلقة من الحد الفاصل', 'لأن اللون يتحول إلى بنفسجي', 'لأن الراسب يترسب أسرع'], c: 0, e: 'الحلقة طبقة رفيعة عند التماس؛ الرج يخلط الطبقات ويفسد وضوحها.' },
  { q: 'غاز HCl الناتج من كلوريد مع H₂SO₄ المركز يكوّن ماذا مع ساق مبللة بالنشادر؟', o: ['سحبًا بيضاء من NH₄Cl', 'حلقة بنية', 'راسبًا أصفر'], c: 0, e: 'يتحد HCl مع NH₃ مكونًا دقائق NH₄Cl البيضاء المرئية.' },
  { q: 'أبخرة بنية محمرة تظهر عند تسخين نترات مع H₂SO₄ المركز. ما الغاز؟', o: ['NO₂', 'SO₂', 'CO₂'], c: 0, e: 'يتكوّن HNO₃ ثم يعطي بالتسخين NO₂ البني المحمر.' },
  { q: 'أي راسب فضي أصفر يذوب في حمض النيتريك المخفف؟', o: ['AgI', 'Ag₃PO₄', 'Ag₂S'], c: 1, e: 'فوسفات الفضة الصفراء تذوب في HNO₃؛ يوديد الفضة الأصفر لا يذوب.' },
  { q: 'تحول ثنائي كرومات البوتاسيوم المحمضة من البرتقالي إلى الأخضر يدل غالبًا على:', o: ['وجود عامل مختزل مثل SO₂', 'وجود عامل مؤكسد فقط', 'تكوّن AgCl'], c: 0, e: 'SO₂ يختزل Cr₂O₇²⁻ البرتقالي إلى Cr³⁺ الأخضر.' },
  { q: 'ما لون البرمنجنات المحمضة قبل اختزالها؟', o: ['بنفسجي', 'أخضر', 'أصفر'], c: 0, e: 'أيون MnO₄⁻ بنفسجي؛ اختزاله إلى Mn²⁺ يزيل اللون أو يبهته.' },
  { q: 'راسب AgBr يوصف غالبًا بأنه:', o: ['أبيض مصفر/كريمي', 'أسود فوري', 'أصفر فاقع'], c: 0, e: 'بروميد الفضة كريمي ويغمق بالضوء، ويذوب ببطء في النشادر المركز.' },
  { q: 'أي راسب يغمق بالضوء ويذوب بسرعة في النشادر؟', o: ['AgCl', 'AgI', 'BaSO₄'], c: 0, e: 'هذه خواص AgCl؛ يجمع التأكيد بين اللون الأبيض والذوبان السريع.' },
  { q: 'إضافة حمض مخفف إلى كربونات تطلق غازًا يعكر ماء الجير. ما الغاز؟', o: ['CO₂', 'H₂S', 'NO₂'], c: 0, e: 'الكربونات تعطي CO₂، الذي يعكر ماء الجير بسبب تكوّن CaCO₃.' },
  { q: 'أي ملاحظة تكشف SO₂ بوصفه غازًا مختزلًا؟', o: ['تحول ثنائي الكرومات من البرتقالي إلى الأخضر', 'ظهور حلقة بنية', 'راسب فضي أسود'], c: 0, e: 'SO₂ يختزل ثنائي الكرومات المحمضة من Cr(VI) البرتقالي إلى Cr(III) الأخضر.' },
  { q: 'عند إضافة حمض مخفف إلى كبريتيد، ما الاختبار التأكيدي المذكور في الدرس؟', o: ['اسوداد ورقة أسيتات الرصاص', 'تعكر ماء الجير', 'ذوبان AgCl'], c: 0, e: 'يتكون H₂S الذي يسوّد ورقة أسيتات الرصاص؛ الغاز سام ولا يُستنشق.' },
  { q: 'في دورق مفتوح تفاعل الثيوكبريتات مع الحمض. لماذا تنخفض قراءة الميزان؟', o: ['لأن SO₂ يغادر الوعاء', 'لأن الكبريت يختفي', 'لأن الماء يتحول إلى غاز فقط'], c: 0, e: 'الميزان المفتوح يقيس ما بقي على الكفة؛ خروج SO₂ يخفض الكتلة المقروءة.' },
  { q: 'ما الدليل البصري الآخر في تفاعل الثيوكبريتات مع الحمض؟', o: ['معلق كبريت أصفر', 'راسب AgI', 'حلقة بنية'], c: 0, e: 'يتكون كبريت صلب دقيق يسبب تعكرًا أصفر بالتزامن مع انطلاق SO₂.' },
  { q: 'أي مجموعة تكشف عادة بإضافة H₂SO₄ المركز الساخن؟', o: ['Cl⁻ وBr⁻ وI⁻ وNO₃⁻', 'SO₄²⁻ وPO₄³⁻ فقط', 'CO₃²⁻ وS²⁻ فقط'], c: 0, e: 'هذه أنيونات أحماض متوسطة الثبات؛ يكشفها الحمض المركز الساخن مع مشاهدة غاز/بخار مميز.' },
  { q: 'ما الترتيب الصحيح لذوبان رواسب هاليدات الفضة في النشادر؟', o: ['AgCl سريع، AgBr ببطء، AgI لا يذوب', 'AgI سريع، AgBr ببطء، AgCl لا يذوب', 'كلها تذوب بالسرعة نفسها'], c: 0, e: 'تدرج الذوبان في النشادر المركز وسيلة تأكيد: الكلوريد سريع، البروميد بطيء، واليوديد غير ذائب.' },
];

type WorkshopStep = { item: string; target: string; title: string; observation: string; explanation: string; color: string; stage: string; hint: string };
type WorkshopScenario = { id: string; title: string; note: string; sample: string; tools: string[]; targets: { id: string; label: string; apparatus: string }[]; steps: WorkshopStep[]; safety: string; final: string };
const toolLabels: Record<string, string> = {
  agno3: 'نترات الفضة AgNO₃', ammonia: 'النشادر NH₃', barium: 'كلوريد الباريوم BaCl₂',
  hcl: 'حمض الهيدروكلوريك المخفف HCl', feso4: 'FeSO₄ حديث التحضير', sulfuric: 'حمض الكبريتيك المركز',
  solid: 'ملح كلوريد صلب', chlorideSolution: 'محلول العينة', glassrod: 'ساق مبللة بالنشادر',
  nitrateSolution: 'محلول النترات', phosphateSolution: 'محلول الفوسفات', sulfateSolution: 'محلول الكبريتات',
  nitric: 'حمض النيتريك المخفف', lead: 'أسيتات الرصاص', water: 'ماء مقطر',
};
const workshopScenarios: WorkshopScenario[] = [
  {
    id: 'chloride', title: 'الكشف عن أيون الكلوريد', note: 'تجربتان منفصلتان: كشف غازي لملح صلب، ثم تأكيد مستقل لمحلول العينة.', sample: 'ملح كلوريد صلب + محلول عينة جديد',
    tools: ['solid', 'sulfuric', 'glassrod', 'chlorideSolution', 'agno3', 'ammonia'],
    targets: [{id:'solid-tube',label:'أنبوبة الملح الصلب',apparatus:'أنبوبة الكشف'}, {id:'tube-mouth',label:'فوهة الأنبوبة · ساق النشادر',apparatus:'موضع الساق'}, {id:'solution-tube',label:'أنبوبة محلول العينة',apparatus:'أنبوبة التأكيد'}, {id:'precipitate-zone',label:'منطقة راسب الفضة',apparatus:'فحص الراسب'}],
    steps: [
      {item:'solid',target:'solid-tube',title:'الكشف عن الكلوريد · ضع الملح الصلب',observation:'استقرت العينة الصلبة في أنبوبة الكشف الأولى.',explanation:'هذا المسار يبدأ بملح جاف؛ لا تستخدم محلول العينة في أنبوبة الكشف الغازي.',color:'#dcebe7',stage:'ملح صلب في الأنبوبة',hint:'ابدأ بالوعاء المخصص للعينة الصلبة.',},
      {item:'sulfuric',target:'solid-tube',title:'أضف H₂SO₄ المركز (محاكاة)',observation:'يتصاعد HCl عديم اللون من الملح في الرسم.',explanation:'يزيح الحمض المركز HCl من ملح الكلوريد. تمثيل بصري فقط، لا تنفّذ التجربة.',color:'#e4eee8',stage:'غاز HCl في الأنبوبة',hint:'الحمض المركز يضاف إلى الملح الصلب، لا إلى ساق النشادر.',},
      {item:'glassrod',target:'tube-mouth',title:'قرّب ساق النشادر من فوهة الأنبوبة',observation:'ظهرت سحب بيضاء من NH₄Cl عند الفوهة.',explanation:'يتفاعل HCl المتصاعد مع NH₃ على الساق مكونًا دقائق NH₄Cl البيضاء.',color:'#eee9d9',stage:'سحب NH₄Cl بيضاء',hint:'الساق المبللة مكانها عند الفوهة، لا داخل السائل.',},
      {item:'chlorideSolution',target:'solution-tube',title:'التجربة التأكيدية · خذ محلول عينة جديدًا',observation:'أُعدّت أنبوبة مستقلة لاختبار الترسيب.',explanation:'التأكيد بالفضة يحتاج محلولًا منفصلًا؛ لا تخلط مسار الغاز بمسار الراسب.',color:'#dcebe7',stage:'محلول عينة في أنبوبة مستقلة',hint:'انتقل الآن إلى أنبوبة التأكيد، وليس أنبوبة الملح.',},
      {item:'agno3',target:'solution-tube',title:'أضف AgNO₃ إلى محلول العينة',observation:'تكوّن راسب AgCl أبيض.',explanation:'Ag⁺ يتحد مع Cl⁻ مكونًا كلوريد الفضة الأبيض غير الذائب.',color:'#f0ead7',stage:'راسب AgCl أبيض',hint:'أضف نترات الفضة إلى المحلول الجديد.',},
      {item:'ammonia',target:'precipitate-zone',title:'اختبر ذوبان AgCl بالنشادر',observation:'ذاب الراسب الأبيض سريعًا في NH₃.',explanation:'الذوبان السريع يميز AgCl عن AgBr وAgI ويكمل التأكيد.',color:'#d8eee4',stage:'AgCl ذاب في NH₃',hint:'وجّه النشادر إلى الراسب المتكوّن، لا إلى فوهة الأنبوبة.',},
    ], safety:'حمض الكبريتيك المركز وأبخرة HCl خطرة؛ هذه محاكاة بصرية لا تعليمات تنفيذية.', final:'النتيجة: سحب NH₄Cl البيضاء في الكشف، ثم راسب AgCl الأبيض الذائب في النشادر، تؤكد Cl⁻.'
  },
  {
    id: 'nitrate', title: 'الكشف عن أيون النترات', note: 'اختبار الحلقة البنية يعتمد على طبقتين واضحتين؛ لا ترج الأنبوبة.', sample:'محلول نترات + FeSO₄ حديث + حمض مركز',
    tools:['nitrateSolution','feso4','sulfuric'],
    targets:[{id:'nitrate-tube',label:'أنبوبة محلول النترات',apparatus:'أنبوبة الاختبار'}, {id:'interface',label:'الحد الفاصل بين الطبقتين',apparatus:'سطح التماس'}],
    steps:[
      {item:'nitrateSolution',target:'nitrate-tube',title:'الكشف عن النترات · ضع محلول العينة',observation:'محلول النترات في قاع أنبوبة الاختبار.',explanation:'الاختبار التأكيدي يبدأ بمحلول العينة داخل أنبوبة نظيفة.',color:'#dcebe7',stage:'عينة مائية في الأنبوبة',hint:'ضع محلول النترات في قاع أنبوبة الاختبار.',},
      {item:'feso4',target:'nitrate-tube',title:'أضف FeSO₄ حديث التحضير',observation:'أصبح المحلول محتويًا على Fe²⁺ قبل تكوين الطبقة.',explanation:'Fe²⁺ عامل الاختزال الذي يساهم في تكوين معقد الحلقة البنية.',color:'#e5dfc9',stage:'FeSO₄ في محلول العينة',hint:'أضف FeSO₄ إلى الأنبوبة قبل الحمض المركز.',},
      {item:'sulfuric',target:'interface',title:'التجربة التأكيدية · طبقة حمض على الجدار',observation:'ظهرت حلقة بنية رفيعة عند الحد الفاصل.',explanation:'تتكون الحلقة عند سطح التماس بفعل معقد النيتروسيل الحديدي؛ الإضافة في غير الحد الفاصل أو الرج يفسد المشاهدة.',color:'#9a5637',stage:'حلقة بنية عند الحد الفاصل',hint:'الحمض المركز يمثل طبقة منفصلة على الجدار؛ لا ترج الأنبوبة.',},
    ], safety:'تحذير مهم: الحمض المركز شديد التآكل. اختبار الحلقة البنية خطر ويُعرض هنا كمحاكاة فقط؛ لا يُنفذ خارج مختبر مجهز وتحت إشراف المعلم.',final:'النتيجة: الحلقة البنية الرفيعة عند الحد الفاصل تؤكد أيون NO₃⁻.'
  },
  {
    id:'phosphate',title:'الكشف عن الفوسفات',note:'الكشف الأول يكوّن راسب باريوم أبيض يذوب في الحمض المخفف؛ ثم اختبار فضة تأكيدي مستقل.',sample:'محلول فوسفات + BaCl₂ + HCl مخفف؛ تأكيد AgNO₃',tools:['phosphateSolution','barium','hcl','agno3','ammonia','nitric'],
    targets:[{id:'barium-tube',label:'أنبوبة الكشف · محلول العينة',apparatus:'أنبوبة الكشف'}, {id:'barium-precipitate',label:'راسب الباريوم الأبيض',apparatus:'منطقة الراسب'}, {id:'confirm-tube',label:'أنبوبة التأكيد · محلول جديد',apparatus:'أنبوبة التأكيد'}, {id:'silver-precipitate',label:'راسب الفضة الأصفر',apparatus:'منطقة الراسب'}],
    steps:[
      {item:'phosphateSolution',target:'barium-tube',title:'الكشف عن الفوسفات · ضع محلول العينة',observation:'محلول الفوسفات في أنبوبة الكشف.',explanation:'ابدأ بمحلول مائي للكشف بأيون الباريوم.',color:'#dcebe7',stage:'محلول العينة في أنبوبة الكشف',hint:'ابدأ بعينة الفوسفات في أنبوبة الكشف.',},
      {item:'barium',target:'barium-tube',title:'أضف BaCl₂',observation:'تكوّن راسب أبيض من فوسفات الباريوم.',explanation:'تتفاعل أيونات Ba²⁺ مع PO₄³⁻ مكونة Ba₃(PO₄)₂ الأبيض.',color:'#eee9d9',stage:'راسب باريوم أبيض',hint:'أضف كلوريد الباريوم إلى أنبوبة الكشف.',},
      {item:'hcl',target:'barium-precipitate',title:'ميّز الراسب بـ HCl المخفف',observation:'ذاب راسب الفوسفات الأبيض تدريجيًا.',explanation:'فوسفات الباريوم تذوب في الحمض المخفف؛ بخلاف كبريتات الباريوم.',color:'#dceee5',stage:'راسب الفوسفات ذاب في الحمض',hint:'ضع الحمض على الراسب الأبيض، لا في أنبوبة التأكيد.',},
      {item:'phosphateSolution',target:'confirm-tube',title:'التجربة التأكيدية · خذ محلولًا جديدًا',observation:'أُعدّت عينة جديدة لمسار الفضة.',explanation:'اختبار التأكيد مستقل عن اختبار ترسيب الباريوم.',color:'#dcebe7',stage:'محلول جديد في أنبوبة التأكيد',hint:'التأكيد يتم على محلول جديد منفصل.',},
      {item:'agno3',target:'confirm-tube',title:'أضف نترات الفضة',observation:'ظهر راسب أصفر من Ag₃PO₄.',explanation:'فوسفات الفضة صفراء، وتقدم دليلًا تأكيديًا إضافيًا.',color:'#d7b93f',stage:'راسب Ag₃PO₄ أصفر',hint:'أضف نترات الفضة إلى عينة التأكيد.',},
      {item:'ammonia',target:'silver-precipitate',title:'اختبر ذوبان الراسب الأصفر',observation:'ذاب راسب Ag₃PO₄ في النشادر.',explanation:'ذوبان فوسفات الفضة في النشادر يميزها عن AgI الأصفر غير الذائب.',color:'#d8eee4',stage:'Ag₃PO₄ ذاب في NH₃',hint:'النشادر تضاف إلى راسب الفضة الأصفر.',},
    ],safety:'تُعرض الأحماض والكواشف كرسوم تعليمية فقط؛ لا تخلط المواد الحقيقية.',final:'النتيجة: راسب Ba₃(PO₄)₂ الأبيض يذوب في HCl المخفف، ويتكون Ag₃PO₄ أصفر في اختبار التأكيد.'
  },
  {
    id:'sulfate',title:'الكشف عن أيون الكبريتات',note:'راسب BaSO₄ الأبيض يبقى في الحمض المخفف؛ ويؤكّد اختبار الرصاص النتيجة.',sample:'محلول كبريتات + BaCl₂ + HCl مخفف؛ تأكيد بأسيتات الرصاص',tools:['sulfateSolution','barium','hcl','lead'],
    targets:[{id:'barium-tube',label:'أنبوبة الكشف · محلول العينة',apparatus:'أنبوبة الكشف'}, {id:'barium-precipitate',label:'راسب الباريوم الأبيض',apparatus:'منطقة الراسب'}, {id:'confirm-tube',label:'أنبوبة التأكيد · محلول جديد',apparatus:'أنبوبة التأكيد'}, {id:'lead-precipitate',label:'منطقة راسب التأكيد',apparatus:'راسب الرصاص'}],
    steps:[
      {item:'sulfateSolution',target:'barium-tube',title:'الكشف عن الكبريتات · ضع محلول العينة',observation:'محلول الكبريتات في أنبوبة الكشف.',explanation:'ابدأ بمحلول مائي لتحري أيون الكبريتات.',color:'#dcebe7',stage:'محلول العينة في أنبوبة الكشف',hint:'ضع محلول الكبريتات في الأنبوبة الأولى.',},
      {item:'barium',target:'barium-tube',title:'أضف BaCl₂',observation:'تكوّن راسب أبيض من BaSO₄.',explanation:'Ba²⁺ مع SO₄²⁻ يعطي كبريتات الباريوم البيضاء شديدة عدم الذوبان.',color:'#eee9d9',stage:'راسب BaSO₄ أبيض',hint:'أضف BaCl₂ إلى محلول العينة.',},
      {item:'hcl',target:'barium-precipitate',title:'اختبر الراسب بـ HCl المخفف',observation:'بقي الراسب الأبيض دون ذوبان.',explanation:'عدم ذوبان BaSO₄ في الحمض المخفف يميزه عن فوسفات الباريوم.',color:'#f0e8d5',stage:'BaSO₄ بقي دون ذوبان',hint:'وجّه الحمض إلى الراسب. بقاء الراسب هو الدليل.',},
      {item:'sulfateSolution',target:'confirm-tube',title:'التجربة التأكيدية · خذ محلولًا جديدًا',observation:'أُعدّت عينة منفصلة لاختبار الرصاص.',explanation:'يُجرى التأكيد على جزء جديد من المحلول لتجنب خلط المسارين.',color:'#dcebe7',stage:'عينة جديدة للتأكيد',hint:'انتقل إلى أنبوبة التأكيد بمحلول جديد.',},
      {item:'lead',target:'confirm-tube',title:'أضف أسيتات الرصاص',observation:'تكوّن راسب أبيض من PbSO₄.',explanation:'يتحد الرصاص الثنائي مع الكبريتات مكونًا كبريتات الرصاص البيضاء غير الذائبة.',color:'#eee9d9',stage:'راسب PbSO₄ أبيض',hint:'أسيتات الرصاص تضاف إلى المحلول الجديد.',},
    ],safety:'محاكاة تعليمية فقط. أملاح الرصاص سامة ويجب عدم لمسها أو التخلص منها خارج بروتوكول مختبر مدرسي.',final:'النتيجة: BaSO₄ الأبيض لا يذوب في HCl المخفف، ويتأكد SO₄²⁻ بترسيب PbSO₄ الأبيض.'
  },
];

function GoldenSheet() {
  const summaries = [
    ['١', 'الثبات والاستقرار', 'الثابت يزيح الأقل ثباتًا؛ حدّد هل الناتج غاز/بخار.', 'المركز الساخن: Cl⁻، Br⁻، I⁻، NO₃⁻ · المخفف: CO₃²⁻، SO₃²⁻، S²⁻، S₂O₃²⁻، NO₂⁻.'],
    ['٢', 'حمض الكبريتيك المركز', 'اربط الأنيون بالناتج ثم الكاشف التأكيدي.', 'HCl + NH₃: سحب بيضاء · Br₂: برتقالي محمر · I₂: بنفسجي · NO₂: بني محمر.'],
    ['٣', 'مجموعة كلوريد الباريوم', 'كلا الراسبين أبيض؛ اختبار الحمض المخفف يحسم.', 'Ba₃(PO₄)₂ يذوب في HCl المخفف؛ BaSO₄ لا يذوب.'],
    ['٤', 'رواسب نترات الفضة', 'اجمع اللون مع الذوبان في النشادر، ولا تعتمد على اللون وحده.', 'AgCl أبيض/يذوب سريعًا · AgBr كريمي/ببطء · AgI أصفر/لا يذوب.'],
    ['٥', 'الأكسدة والاختزال', 'المختزل يغيّر لون الكاشف المؤكسد.', 'KMnO₄: بنفسجي ← باهت · K₂Cr₂O₇: برتقالي ← أخضر.'],
    ['٦', 'المنحنيات والميزان', 'فسّر اتجاه الكتلة وحدّد ما غادر النظام.', 'راسب يتكون ثم يذوب؛ في الدورق المفتوح ينقص الوزن لخروج SO₂، ويبقى الكبريت الأصفر.'],
  ];
  return <section className="destination-section" id="golden" data-testid="section-golden">
    <div className="destination-heading"><span className="destination-mark"><Sparkles size={22} /></span><div><span className="eyebrow">ورقة المراجعة عالية العائد</span><h2>الورقة الذهبية</h2><p>ستة فصول، وست مفاتيح تذكّر قبل الامتحان.</p></div></div>
    <p className="golden-intro">اقرأ علامة المشاهدة أولًا ثم اربطها بالكاشف والاستنتاج. هذه خلاصة تعليمية للمراجعة السريعة، وتبقي التفاصيل والتدريبات الأصلية في وجهاتها المستقلة.</p>
    <div className="golden-grid">{summaries.map(([n, title, intro, clue]) => <article className="golden-card" key={n} data-testid={`card-golden-${n}`}>
      <header><span>{n}</span><h3>{title}</h3></header><p>{intro}</p><p className="golden-clue"><b>علامة امتحانية:</b> {clue}</p>
    </article>)}</div>
    <aside className="note-callout"><b>تذكير UNV</b><p>المشاهدة تقود إلى الاستنتاج، لكن شروط الوسط والتركيز مهمة. التجارب هنا محاكاة تعليمية فقط.</p></aside>
  </section>;
}

function PracticeSection() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const answered = Object.keys(answers).length;
  const correct = practiceQuestions.reduce((sum, item, i) => sum + (answers[i] === item.c ? 1 : 0), 0);
  return <section className="destination-section practice-section" id="practice" data-testid="section-practice">
    <div className="destination-heading"><span className="destination-mark"><GraduationCap size={23} /></span><div><span className="eyebrow">تدريب جديد · مستقل عن بنك المصدر</span><h2>تدريب الاختيار من متعدد</h2><p>٢٠ سؤالًا مبنيًا على المشاهدة، مع تغذية راجعة فورية.</p></div></div>
    <div className="practice-toolbar" aria-live="polite"><p>اختر إجابة؛ سيظهر تفسيرها فورًا. يمكنك تغيير اختيارك في أي وقت.</p><strong>{correct} / {answered}</strong></div>
    <div className="practice-progress" aria-label={`أجبت عن ${answered} من ${practiceQuestions.length}`}><span style={{ width: `${answered / practiceQuestions.length * 100}%` }} /></div>
    <div className="practice-grid">{practiceQuestions.map((item, index) => {
      const choice = answers[index];
      return <article className="practice-card" key={index} data-testid={`card-practice-${index}`}>
        <h3><span className="q-number">{String(index + 1).padStart(2, '0')}</span> {item.q}</h3>
        <div className="quiz-options">{item.o.map((option, optionIndex) => <label className={choice === optionIndex ? 'chosen' : ''} key={optionIndex}>
          <input type="radio" name={`practice-${index}`} checked={choice === optionIndex} onChange={() => setAnswers((a) => ({ ...a, [index]: optionIndex }))} data-testid={`radio-practice-${index}-${optionIndex}`} />
          <span className="radio-mark" />{option}
        </label>)}</div>
        {choice !== undefined && <div className={`practice-feedback ${choice === item.c ? 'correct' : 'incorrect'}`} aria-live="polite" data-testid={`feedback-practice-${index}`}>
          <b>{choice === item.c ? 'إجابة صحيحة' : 'ليست هذه العلامة المناسبة.'}</b> {item.e}
        </div>}
      </article>;
    })}</div>
    <div className="workshop-controls"><button className="button button-quiet" onClick={() => setAnswers({})} data-testid="button-reset-practice"><RotateCcw size={15} /> إعادة التدريب</button></div>
  </section>;
}

function LegacyWorkshop() {
  const [scenarioId, setScenarioId] = useState(workshopScenarios[0].id);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [hint, setHint] = useState(0);
  const scenario = workshopScenarios.find((item) => item.id === scenarioId) || workshopScenarios[0];
  const complete = step >= scenario.steps.length;
  const current = scenario.steps[step];
  const currentColor = step ? scenario.steps[Math.min(step - 1, scenario.steps.length - 1)].color : '#dcebe7';
  const stageText = step ? scenario.steps[Math.min(step - 1, scenario.steps.length - 1)].stage : 'محلول شفاف · بانتظار بدء الاختبار';

  const chooseScenario = (id: string) => { setScenarioId(id); setStep(0); setSelected(null); setFeedback(null); setHint(0); };
  const performAction = (item: string) => {
    if (complete || !current) return;
    if (item === current.item) {
      setStep((value) => value + 1);
      setSelected(null);
      setFeedback({ ok: true, text: `${current.title}: ${current.observation}` });
    } else {
      setSelected(null);
      setFeedback({ ok: false, text: `غلط — اخترت «${toolLabels[item] || item}» في غير موضعها. المطلوب الآن «${toolLabels[current.item]}» لأن ${current.explanation} صحّح المسار باختيار الأداة المطلوبة من القائمة.` });
    }
  };
  const dragStart = (event: DragEvent<HTMLButtonElement>, item: string) => event.dataTransfer.setData('text/plain', item);
  const dropItem = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); const item = event.dataTransfer.getData('text/plain'); if (item) performAction(item); else if (selected) performAction(selected); };
  const undo = () => {
    if (step === 0) return;
    setStep((value) => Math.max(0, value - 1));
    setFeedback({ ok: true, text: 'عُدنا خطوة واحدة. أعد تنفيذ الإجراء أو اختر أداة أخرى.' });
    setHint(0);
  };
  const reset = () => { setStep(0); setSelected(null); setFeedback(null); setHint(0); };
  const showHint = () => setHint((value) => Math.min(value + 1, 2));
  const hintText = hint === 1 ? `تلميح ١: ${current ? current.title : 'انتهت المحاكاة؛ أعدها لتجربة الخطوات.'}` : hint >= 2 && current ? `تلميح ٢: استخدم ${toolLabels[current.item]}؛ ثم اقرأ ${current.observation}` : '';

  return <section className="destination-section" id="workshop" data-testid="section-workshop">
    <div className="workshop-section">
      <div className="workshop-head"><div className="destination-heading"><span className="destination-mark"><Microscope size={23} /></span><div><span className="eyebrow">مختبر افتراضي · اسحب، أو اختر ثم المس موضع التجربة</span><h2>ورشة الإحساس العملي</h2><p>اتخذ القرار خطوة بخطوة؛ الأداة الصحيحة تغيّر الرسم والنتيجة.</p></div></div><span className="workshop-badge">محاكاة تعليمية — لا توجد مواد حقيقية</span></div>
      <div className="scenario-tabs" role="tablist" aria-label="سيناريوهات المختبر">{workshopScenarios.map((item) => <button key={item.id} className={scenarioId === item.id ? 'selected' : ''} onClick={() => chooseScenario(item.id)} role="tab" aria-selected={scenarioId === item.id} data-testid={`tab-scenario-${item.id}`}>{item.title}</button>)}</div>
      <p className="sim-intro">{scenario.note}</p>
      <div className="workshop-layout">
        <div className="apparatus-panel">
          <div className="apparatus-label"><span>موضع التجربة</span><small>{complete ? 'اكتملت المحاكاة' : `خطوة ${step + 1} من ${scenario.steps.length}`}</small></div>
          <svg className="apparatus-svg" viewBox="0 0 300 200" role="img" aria-label={`أنبوبة اختبار: ${stageText}`} data-testid="visual-apparatus">
            <defs><linearGradient id="tubeGlass" x1="0" x2="1"><stop stopColor="#d8ebe6" stopOpacity=".7" /><stop offset=".52" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#bddbd4" stopOpacity=".68" /></linearGradient></defs>
            <path d="M104 25h92M117 26v105a39 39 0 0 0 78 0V26" fill="url(#tubeGlass)" stroke="#658e88" strokeWidth="4" strokeLinecap="round" />
            <path className="liquid" d={step > 0 ? 'M121 91h70v39a35 35 0 0 1-70 0z' : 'M121 116h70v14a35 35 0 0 1-70 0z'} fill={currentColor} opacity=".92" />
            <path d="M122 93c18-6 43 6 68-1" stroke="#fff" strokeWidth="3" opacity=".8" fill="none" />
            {scenarioId === 'nitrate' && step >= 2 && <path d="M122 96h68" stroke="#7e3d29" strokeWidth="6" opacity=".88"><animate attributeName="opacity" values=".3;1;.75" dur="1.3s" repeatCount="indefinite" /></path>}
            {step > 0 && scenarioId !== 'nitrate' && step < scenario.steps.length && <g fill="#fffdf2"><circle cx="143" cy="116" r="4" /><circle cx="166" cy="128" r="3" /><circle cx="177" cy="111" r="2.5" /></g>}
            <path d="M127 39v40" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
            <path d="M221 39l31-23M217 43l30 7" fill="none" stroke="#c49e52" strokeWidth="5" strokeLinecap="round" />
            <path d="M252 16l11-8M247 50l12 3" stroke="#c49e52" strokeWidth="3" strokeLinecap="round" />
            <text x="150" y="184" textAnchor="middle" fill="#657d75" fontSize="10" fontFamily="IBM Plex Sans Arabic">{complete ? 'المشاهدة جاهزة للاستنتاج' : 'أنبوبة اختبار افتراضية'}</text>
          </svg>
          <div className="vessel-note" aria-live="polite" data-testid="text-workshop-observation">{complete ? scenario.final : stageText}</div>
        </div>
        <div className="tool-panel">
          <h3>صينية الأدوات والكواشف</h3><p>اسحب الأداة إلى موضع التجربة أو اضغطها ثم اضغط موضع التجربة.</p>
          <div className="tool-tray">{scenario.tools.map((tool) => <button key={tool} className={`tool-token ${selected === tool ? 'selected' : ''}`} draggable={!complete} onDragStart={(event) => dragStart(event, tool)} onClick={() => setSelected((value) => value === tool ? null : tool)} aria-pressed={selected === tool} data-testid={`tool-${scenarioId}-${tool}`}>
            <span>{tool === 'agno3' || tool === 'barium' ? <Beaker size={15} /> : tool === 'sulfuric' || tool === 'hcl' ? <FlaskConical size={15} /> : <TestTube2 size={15} />}</span>{toolLabels[tool]}
          </button>)}</div>
          <div className={`drop-target ${selected ? 'ready' : ''}`} role="button" tabIndex={0} onClick={() => selected && performAction(selected)} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && selected) performAction(selected); }} onDragOver={(event) => event.preventDefault()} onDrop={dropItem} data-testid="drop-target">
            {complete ? 'اكتملت الخطوات — اقرأ الاستنتاج' : selected ? `إسقاط ${toolLabels[selected]} هنا` : 'موضع الأنبوبة · اسقط الأداة هنا'}
          </div>
          <div className="workshop-controls">
            <button className="button button-quiet" onClick={showHint} disabled={complete} data-testid="button-hint"><Lightbulb size={15} /> تلميح {hint}/٢</button>
            <button className="button button-quiet" onClick={undo} disabled={step === 0} data-testid="button-undo-workshop"><Undo2 size={15} /> تراجع</button>
            <button className="button button-quiet" onClick={reset} data-testid="button-reset-workshop"><RotateCcw size={15} /> إعادة التجربة</button>
          </div>
          {hintText && <div className="hint-box" data-testid="text-workshop-hint">{hintText}</div>}
          {feedback && <div className={`workshop-feedback ${feedback.ok ? 'success' : 'error'}`} aria-live="polite" data-testid="text-workshop-feedback">{feedback.text}</div>}
          {complete && <div className="workshop-explanation" data-testid="text-workshop-explanation"><b>لماذا تقود المشاهدة إلى النتيجة؟</b> {scenario.final}</div>}
        </div>
      </div>
      {current && step > 0 && <div className="workshop-explanation"><b>تفسير الخطوة السابقة:</b> {scenario.steps[step - 1].explanation}</div>}
      <div className="workshop-safety"><ShieldAlert size={16} /><span>سلامة: هذه محاكاة فقط. لا تخلط الكواشف ولا تتعامل مع H₂SO₄ المركز أو أبخرة NO₂ خارج مختبر مجهز وتحت إشراف معلم. تُعرض إضافة الحمض المركز هنا كتمثيل بصري لا كإرشاد عملي.</span></div>
    </div>
  </section>;
}
void LegacyWorkshop;

function Workshop() {
  const [scenarioId, setScenarioId] = useState('chloride');
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ok:boolean;text:string}|null>(null);
  const [hint, setHint] = useState(0);
  const scenario = workshopScenarios.find((entry) => entry.id === scenarioId) || workshopScenarios[0];
  const current = scenario.steps[step];
  const complete = step >= scenario.steps.length;
  const previous = scenario.steps[step - 1];
  const place = (item: string, targetId: string) => {
    if (!current) return;
    const target = scenario.targets.find((entry) => entry.id === targetId);
    if (current.item === item && current.target === targetId) {
      setAdded((items) => [...items, `${targetId}:${item}`]);
      setStep((value) => value + 1);
      setFeedback({ok:true,text:`${current.title}: ${current.observation} ${current.explanation}`});
      setHint(0);
    } else {
      setFeedback({ok:false,text:`غلط — «${toolLabels[item]}» وُضع في «${target?.label || targetId}». ${current.item !== item ? `المطلوب الآن «${toolLabels[current.item]}».` : `الموضع الصحيح «${scenario.targets.find((entry) => entry.id === current.target)?.label}».`} خطأ في ترتيب/مكان الاختبار: ${current.explanation} أعد المحاولة بالمادة والموضع الصحيحين.`});
    }
    setSelected(null);
  };
  const selectExperiment = (id: string) => { setScenarioId(id); setStep(0); setSelected(null); setAdded([]); setFeedback(null); setHint(0); };
  const reset = () => { setStep(0); setSelected(null); setAdded([]); setFeedback(null); setHint(0); };
  const undo = () => {
    if (!previous) return;
    setAdded((items) => items.filter((item) => item !== `${previous.target}:${previous.item}`));
    setStep((value) => value - 1);
    setFeedback({ok:true,text:'تم التراجع خطوة؛ يمكنك إعادة الإجراء أو تصحيح مساره.'});
    setHint(0);
  };
  const displayIon = scenarioId === 'chloride' ? 'الكلوريد' : scenarioId === 'nitrate' ? 'النترات' : scenarioId === 'phosphate' ? 'الفوسفات' : 'الكبريتات';
  return <section className="destination-section" id="workshop" data-testid="section-workshop">
    <div className="workshop-section">
      <div className="workshop-head"><div className="destination-heading"><span className="destination-mark"><Microscope size={23}/></span><div><span className="eyebrow">محاكاة مخبرية تفاعلية</span><h2>ورشة الإحساس العملي</h2><p></p></div></div><span className="workshop-badge">محاكاة تعليمية — لا توجد مواد حقيقية</span></div>
      <div className="scenario-tabs" aria-label="قائمة التجارب">{workshopScenarios.map((entry) => <button key={entry.id} className={entry.id === scenarioId ? 'selected' : ''} onClick={() => selectExperiment(entry.id)} aria-pressed={entry.id === scenarioId} data-testid={`experiment-${entry.id}`}>{entry.title}</button>)}</div>
      <p className="sim-intro">{scenario.note}</p>
      <div className="experiment-subheads"><span>الكشف عن {displayIon}</span><span>التجربة التأكيدية لـ {displayIon}</span></div>
      <p className="sim-intro">العينة والأدوات: {scenario.sample}</p>
      <div className="workshop-layout">
        <div className="apparatus-panel">
          <div className="apparatus-label"><span>جهاز التجربة ومواضع الإسقاط</span><small>{complete ? 'اكتملت التجربة' : `الخطوة ${step + 1} من ${scenario.steps.length}`}</small></div>
          <div className="apparatus-shelf">{scenario.targets.map((target,index) => {
            const hasItem = added.some((entry) => entry.startsWith(`${target.id}:`));
            const isCurrent = current?.target === target.id;
            return <div className={`apparatus-location ${isCurrent ? 'is-active' : ''} ${hasItem ? 'has-content' : ''}`} key={target.id} role="button" tabIndex={0} onClick={() => selected && place(selected,target.id)} onKeyDown={(event) => { if (selected && (event.key === 'Enter' || event.key === ' ')) place(selected,target.id); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {event.preventDefault();const dragged=event.dataTransfer.getData('text/plain') || selected;if(dragged)place(dragged,target.id);}} data-testid={`drop-location-${target.id}`}>
              <span className="location-label">{target.label}</span>
              <svg viewBox="0 0 120 130" role="img" aria-label={`${target.apparatus}: ${hasItem ? (previous?.stage || 'تغيرت محتويات الجهاز') : 'فارغ'}`}>
                <path d="M33 12h54M39 13v70a21 21 0 0 0 42 0V13" fill="rgba(222,240,234,.62)" stroke="#658e88" strokeWidth="3" strokeLinecap="round"/>
                <path d={hasItem ? 'M43 60h34v22a17 17 0 0 1-34 0z' : 'M43 74h34v8a17 17 0 0 1-34 0z'} fill={hasItem ? (previous?.color || '#eee9d9') : '#dcebe7'} opacity=".95"/>
                {hasItem && scenarioId === 'nitrate' && step >= 3 && target.id === 'interface' && <path d="M43 60h34" stroke="#873b25" strokeWidth="7"/>}
                {hasItem && scenarioId === 'chloride' && step >= 3 && target.id === 'tube-mouth' && <g fill="#fff"><circle cx="48" cy="33" r="5"/><circle cx="62" cy="26" r="6"/><circle cx="75" cy="34" r="4"/></g>}
                {hasItem && target.id.includes('precipitate') && <g fill={scenarioId === 'phosphate' && step >= 5 ? '#d6b83f' : '#fffdf3'}><circle cx="50" cy="86" r="4"/><circle cx="62" cy="82" r="5"/><circle cx="72" cy="88" r="3"/></g>}
                {index === 1 && <path d="M47 10v24M44 15h20" stroke="#c49e52" strokeWidth="3" strokeLinecap="round"/>}
              </svg>
              <small>{target.apparatus}</small>
              {hasItem && <span className="added-label">{added.filter((entry) => entry.startsWith(`${target.id}:`)).map((entry) => toolLabels[entry.split(':')[1]]).join(' · ')}</span>}
            </div>;
          })}</div>
          <div className="vessel-note" aria-live="polite" data-testid="text-workshop-observation">{complete ? scenario.final : previous?.stage || 'الأجهزة جاهزة؛ ابدأ بالخطوة الأولى.'}</div>
        </div>
        <div className="tool-panel">
          <h3>الأجسام والكواشف</h3><p>{selected ? `حدد «${toolLabels[selected]}»؛ اختر موضع الجهاز المناسب.` : ''}</p>
          <div className="tool-tray">{scenario.tools.map((tool) => <button key={tool} className={`tool-token ${selected === tool ? 'selected' : ''}`} draggable={!complete} onDragStart={(event) => event.dataTransfer.setData('text/plain',tool)} onClick={() => setSelected((value) => value === tool ? null : tool)} aria-pressed={selected === tool} data-testid={`draggable-${scenario.id}-${tool}`}><span>{tool === 'agno3' || tool === 'barium' || tool === 'lead' ? <Beaker size={15}/> : tool === 'sulfuric' || tool === 'hcl' || tool === 'nitric' ? <FlaskConical size={15}/> : <TestTube2 size={15}/>}</span>{toolLabels[tool]}</button>)}</div>
          <div className="workshop-controls">
            <button className="button button-quiet" onClick={() => setHint((value) => Math.min(value+1,2))} disabled={complete} data-testid="button-hint"><Lightbulb size={15}/> تلميح {hint}/٢</button>
            <button className="button button-quiet" onClick={undo} disabled={step===0} data-testid="button-undo-workshop"><Undo2 size={15}/> تراجع</button>
            <button className="button button-quiet" onClick={reset} data-testid="button-reset-workshop"><RotateCcw size={15}/> إعادة التجربة</button>
          </div>
          {hint > 0 && current && <div className="hint-box" data-testid="feedback-hint">{hint === 1 ? `تلميح ١: ${current.title}` : `تلميح ٢: ضع «${toolLabels[current.item]}» في «${scenario.targets.find((entry) => entry.id === current.target)?.label}».`}</div>}
          {feedback && <div className={`workshop-feedback ${feedback.ok ? 'success' : 'error'}`} aria-live="polite" data-testid="text-workshop-feedback">{feedback.text}</div>}
          {complete && <div className="workshop-explanation" data-testid="text-workshop-explanation"><b>الاستنتاج:</b> {scenario.final}</div>}
          <div className="workshop-steps" aria-label="متتبع خطوات التجربة">{scenario.steps.map((action,index) => <div key={`${action.item}-${index}`} className={index < step ? 'step-done' : index === step ? 'step-current' : ''}><span>{index < step ? <Check size={14}/> : index+1}</span><p>{action.title}</p><small>{scenario.targets.find((entry) => entry.id === action.target)?.label}</small></div>)}</div>
          <div className="workshop-safety"><ShieldAlert size={16}/><span>{scenario.safety}</span></div>
        </div>
      </div>
    </div>
  </section>;
}

const chapterNames = [
  'الثبات والاستقرار — مفتاح التحليل',
  'أنيونات حمض الكبريتيك المركز',
  'مجموعة كلوريد الباريوم',
  'موسوعة رواسب نترات الفضة',
  'الأكسدة والاختزال وتغيّر اللون',
  'المخططات والمنحنيات والميزان الرقمي',
];

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function Chem({ children }: { children: string }) {
  return <span className="latin">{children}</span>;
}

function Equation({ children }: { children: string }) {
  return <span className="equation">{children}</span>;
}

function ChapterHeading({ index, title }: { index: string; title: string }) {
  return (
    <header className="chapter-heading">
      <span className="chapter-number">{index}</span>
      <div>
        <p className="eyebrow">دليل المختبر · الفصل {index}</p>
        <h2>{title}</h2>
        <span className="credit">من إعداد وتنسيق تيم UNV</span>
      </div>
    </header>
  );
}

function LabSimulation({ id, title, intro }: { id: string; title: string; intro: string }) {
  const [step, setStep] = useState(0);
  const list = labs[id] || [];
  const current = list[step];
  return (
    <article className="sim-card">
      <div className="sim-top">
        <div className="sim-icon"><Microscope size={21} /></div>
        <div>
          <span className="eyebrow">مختبر تفاعلي ذاتي</span>
          <h3>{title}</h3>
        </div>
      </div>
      <p className="sim-intro">{intro}</p>
      <div className="lab-workspace" aria-live="polite">
        <div className="tube-illustration" aria-hidden="true">
          <svg viewBox="0 0 90 125" role="img">
            <path d="M27 12h36M31 12v74a19 19 0 0 0 38 0V12" fill="none" stroke="#6f9896" strokeWidth="3" strokeLinecap="round" />
            <path d="M34 59h32v27a16 16 0 0 1-32 0z" fill={current ? '#d7a83c' : '#dcebe7'} opacity=".8" />
            <path d="M44 55c-6-12 10-14 5-26M56 50c-5-9 7-12 4-21" fill="none" stroke="#63aaa1" strokeWidth="2" strokeDasharray="3 4" />
            <circle cx="45" cy="73" r="4" fill="#fff9e9" /><circle cx="56" cy="82" r="3" fill="#fff9e9" />
          </svg>
        </div>
        <div className="lab-content">
          <div className="step-label">{current ? `الخطوة ${step + 1} من ${list.length}` : step >= list.length ? 'اكتملت المحاكاة' : 'ابدأ بالملاحظة'}</div>
          <h4>{current?.t || (step >= list.length ? 'أحسنت. اربط الملاحظة بالاستنتاج.' : 'توقّع قبل أن تكشف النتيجة')}</h4>
          {current ? (
            <>
              <p>{current.o}</p>
              <div className="inference"><Sparkles size={15} /><span><b>الاستنتاج:</b> {current.i}</span></div>
            </>
          ) : <p>{step >= list.length ? 'أعد المحاكاة لتجربة التسلسل مرة أخرى.' : intro}</p>}
        </div>
      </div>
      <div className="sim-actions">
        <button className="button button-primary" onClick={() => setStep((s) => Math.min(s + 1, list.length))} data-testid={`button-next-${id}`}>
          {step >= list.length ? 'اكتملت الخطوات' : step === 0 ? 'ابدأ المحاكاة' : 'الخطوة التالية'} <ArrowLeft size={16} />
        </button>
        <button className="button button-quiet" onClick={() => setStep(0)} data-testid={`button-reset-${id}`}><RotateCcw size={15} /> إعادة التجربة</button>
        <span className="safety-inline"><ShieldAlert size={14} /> محاكاة ذهنية آمنة</span>
      </div>
      <div className="mini-progress" aria-label={`تقدم المحاكاة ${step} من ${list.length}`}><span style={{ width: `${list.length ? step / list.length * 100 : 0}%` }} /></div>
    </article>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead><tr>{headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j}>{v}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function VideoLesson() {
  const videos: { src: string; title: string; note: string }[] = [
    { src: `${import.meta.env.BASE_URL}1017.mov.mp4`, title: 'شرح الدرس', note: 'الشرح الأساسي خطوة بخطوة.' },
    { src: `${import.meta.env.BASE_URL}1017-review.mov.mp4`, title: 'مراجعة وتلخيص', note: 'ملخص سريع للمراجعة قبل الامتحان.' },
  ];
  return <section className="destination-section" id="video" data-testid="section-video">
    <div className="destination-heading"><span className="destination-mark"><Video size={22} /></span><div><span className="eyebrow">شرح بالفيديو</span><h2>شرح الفيديو</h2><p>مشاهدات مكثّفة تشرح الدرس خطوة بخطوة قبل المراجعة.</p></div></div>
    <div className="video-list">{videos.map((item) => <article className="video-card" key={item.src}>
      <div className="video-frame">
        <video controls playsInline preload="metadata" src={item.src}>متصفحك لا يدعم تشغيل الفيديو.</video>
      </div>
      <div className="video-caption"><b>{item.title}</b><p>{item.note}</p></div>
    </article>)}</div>
    <aside className="note-callout"><b>ملاحظة</b><p>شاهد الشرح كاملًا أولًا، ثم عُد إلى الفصول لتطبيق ما رأيته في مختبر المحاكاة.</p></aside>
  </section>;
}

function HomeDashboard({ onNavigate, done }: { onNavigate: (id: string) => void; done: string[] }) {
  const shortcuts = [
    {id:'c1',n:'01',title:'قواعد الثبات',note:'ابدأ من فكرة الإزاحة وثبات الأحماض.',icon:<Activity size={20}/>},
    {id:'c2',n:'02',title:'أنيونات H₂SO₄',note:'تتبّع الغاز من العينة إلى الدليل.',icon:<FlaskConical size={20}/>},
    {id:'c3',n:'03',title:'كلوريد الباريوم',note:'ميّز الفوسفات عن الكبريتات.',icon:<Beaker size={20}/>},
    {id:'c4',n:'04',title:'نترات الفضة',note:'اجمع لون الراسب مع اختبار ذوبانه.',icon:<TestTube2 size={20}/>},
    {id:'c5',n:'05',title:'الأكسدة والاختزال',note:'اقرأ تغير لون الكاشف.',icon:<Sparkles size={20}/>},
    {id:'c6',n:'06',title:'المنحنيات والميزان',note:'فسّر أثر الغاز الخارج والراسب.',icon:<Activity size={20}/>},
    {id:'golden',n:'مراجعة',title:'الورقة الذهبية',note:'ستة مفاتيح للمراجعة السريعة.',icon:<Lightbulb size={20}/>},
    {id:'bank',n:'المصدر',title:'بنك الأسئلة الأصلي',note:'أسئلة الكتاب مع الإجابات المشروحة.',icon:<Search size={20}/>},
    {id:'practice',n:'٢٠ سؤالًا',title:'تدريب الاختيار',note:'تدريب موسع بتغذية راجعة فورية.',icon:<GraduationCap size={20}/>},
    {id:'quiz',n:'اختبار',title:'الاختبار الأصلي',note:'اختبر استيعابك بالمراجعة المرفقة.',icon:<CircleHelp size={20}/>},
    {id:'workshop',n:'مختبر',title:'ورشة التجارب',note:'اسحب العينات والكواشف إلى مواضعها.',icon:<Microscope size={20}/>},
    {id:'video',n:'فيديو',title:'شرح الفيديو',note:'مشاهدة مكثّفة تشرح الدرس.',icon:<Video size={20}/>},
  ];
  return <section className="home-dashboard" data-testid="section-home">
    <div className="home-kicker"><span className="live-dot"/><span>دفتر تفاعلي · الصف الثالث الثانوي</span></div>
    <div className="home-title"><div><span className="eyebrow">التحليل الكيميائي الوصفي · UNV</span><h1>من المشاهدة<br/><em>إلى الاستنتاج.</em></h1><p>مساحة دراسة منظّمة؛ اختر وجهتك، واحتفظ بكل فصل وتجربة في صفحة مستقلة.</p></div><div className="home-index"><span>دفتر المختبر</span><b>{String(done.length).padStart(2,'0')}<small>/06</small></b><span>فصول تمت مراجعتها</span></div></div>
    <div className="shortcut-head"><div><span className="eyebrow">محتوى الدفتر</span><h2>اختر صفحة للدراسة</h2></div><span>من إعداد وتنسيق تيم UNV</span></div>
    <div className="shortcut-grid">{shortcuts.map((item,index)=><button className={`shortcut-card shortcut-${index}`} key={item.id} onClick={()=>onNavigate(item.id)} data-testid={`shortcut-${item.id}`}><span className="shortcut-icon">{item.icon}</span><span className="shortcut-n">{item.n}</span><b>{item.title}</b><small>{item.note}</small>{item.id.startsWith('c') && done.includes(item.id) && <span className="shortcut-done"><Check size={14}/> تمت المراجعة</span>}<ArrowLeft className="shortcut-arrow" size={17}/></button>)}</div>
    <footer className="home-credit"><span className="brand-mark"><Atom size={20}/></span><span>دفتر الكيمياء الوصفي <b>UNV</b></span><span>محتوى تعليمي أصلي · محاكاة آمنة</span></footer>
  </section>;
}

function App() {
  const [active, setActive] = useState('home');
  const [done, setDone] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('unv-chem-done') || '[]') as string[]; } catch { return []; }
  });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [time, setTime] = useState(28);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
    document.title = 'التحليل الكيميائي الوصفي | دفتر UNV التفاعلي';
  }, []);

  useEffect(() => { localStorage.setItem('unv-chem-done', JSON.stringify(done)); }, [done]);

  const questions = useMemo(() => {
    const termItems: StudyItem[] = terms.map((item, index) => ({
      n: String(index + 1), q: item[0], r: 'تذكّر المصطلح ضمن سياق التحليل النوعي.', a: item[1],
    }));
    return [
      ...essay.map((item) => ({ ...item, kind: 'essay' })),
      ...mcq.map((item) => ({ ...item, kind: 'mcq' })),
      ...termItems.map((item) => ({ ...item, kind: 'terms' })),
    ];
  }, []);
  const filteredQuestions = questions.filter((item) => {
    const matchesKind = filter === 'all' || item.kind === filter;
    const text = `${item.n} ${item.q} ${item.r} ${item.a}`.toLocaleLowerCase('ar');
    return matchesKind && text.includes(query.trim().toLocaleLowerCase('ar'));
  });
  const score = Object.entries(checked).reduce((sum, [key, value]) => {
    const index = Number(key);
    return sum + (value && answers[index] === quizItems[index]?.c ? 1 : 0);
  }, 0);
  const toggleDone = (id: string) => setDone((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const progress = Math.round(done.length / 6 * 100);
  const navigate = (id: string) => {
    setActive(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="app-shell noise" dir="rtl">
      <header className="topbar">
        <button className="mobile-menu" aria-label="فتح القائمة" onClick={() => setMenuOpen((v) => !v)} data-testid="button-menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
        <button className="brand" onClick={() => navigate('home')} data-testid="link-home">
          <span className="brand-mark"><Atom size={22} /></span>
          <span><b>UNV</b><small>دفتر الكيمياء</small></span>
        </button>
        <button className="print-button" onClick={() => window.print()} data-testid="button-print"><BookOpen size={16} /> نسخة للطباعة</button>
      </header>

      <main>
        {false && <section className="hero" id="start">
          <div className="hero-copy">
            <div className="hero-label"><span className="live-dot" /> دفتر تفاعلي · الصف الثالث الثانوي</div>
            <h1>لا تحفظ لون الراسب.<br /><em>افهم قصته.</em></h1>
            <p className="hero-lede">من أول فقاعة إلى آخر راسب: دليل بصري يعلّمك كيف تقرأ المشاهدة، وتصل منها إلى الأنيون والتفاعل.</p>
            <div className="hero-actions">
              <button className="button button-gold" onClick={() => scrollTo('c1')} data-testid="button-start">ابدأ من الأساس <ArrowLeft size={17} /></button>
              <button className="button button-outline" onClick={() => scrollTo('bank')} data-testid="button-bank">افتح بنك الأسئلة <ArrowDownLeft size={17} /></button>
            </div>
            <div className="hero-stats">
              <div><b>٦</b><span>فصول مترابطة</span></div><i />
              <div><b>٩٠</b><span>سؤالًا محلولًا</span></div><i />
              <div><b>٢٠</b><span>مصطلحًا للمراجعة</span></div>
            </div>
          </div>
          <div className="hero-art" aria-label="رسم يشرح رصد التفاعل في أنبوب اختبار">
            <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
            <div className="art-note note-top"><span className="note-dot note-gold" /><span><b>ملاحظة</b><small>راسب أبيض يتكوّن</small></span></div>
            <div className="flask-scene">
              <svg viewBox="0 0 350 390" role="img" aria-label="أنبوبة اختبار بداخلها راسب ملون وفقاعات">
                <defs><linearGradient id="glass" x1="0" x2="1"><stop stopColor="#fff" stopOpacity=".84" /><stop offset=".5" stopColor="#d9f3ed" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity=".67" /></linearGradient><linearGradient id="liquid" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#d6b04c" stopOpacity=".72" /><stop offset="1" stopColor="#b88730" stopOpacity=".9" /></linearGradient></defs>
                <path d="M95 37h160M119 38v190c0 51 28 93 56 93s56-42 56-93V38" fill="url(#glass)" stroke="#e6f5ed" strokeWidth="7" strokeLinecap="round" />
                <path d="M127 190h96v39c0 43-20 75-48 75s-48-32-48-75z" fill="url(#liquid)" />
                <path d="M129 230c17-11 58 8 91-3" stroke="#fff4c7" strokeWidth="4" opacity=".72" fill="none" />
                <circle cx="156" cy="223" r="7" fill="#fff7d8" /><circle cx="183" cy="248" r="5" fill="#fff7d8" /><circle cx="204" cy="214" r="4" fill="#fff7d8" />
                <path d="M105 38h140" stroke="#f2d179" strokeWidth="8" strokeLinecap="round" />
                <path d="M132 75v82" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".65" />
              </svg>
            </div>
            <div className="art-note note-bottom"><span className="note-dot note-teal" /><span><b>تفسير</b><small>اختبر الذوبان للتأكيد</small></span></div>
            <div className="art-index">01 <span>/</span> الملاحظة قبل الاستنتاج</div>
          </div>
          <div className="hero-footer">
            <span>من إعداد وتنسيق تيم UNV</span>
            <span>تحليل كيميائي وصفي <span className="footer-sep">/</span> كتاب الطالب</span>
          </div>
        </section>}
        <div className="content-layout">
          {menuOpen && <button className="drawer-backdrop" aria-label="إغلاق القائمة" onClick={() => setMenuOpen(false)} data-testid="button-close-drawer"/>}
          <aside className={`rail ${menuOpen ? 'drawer-open' : ''}`}>
            <div className="rail-label">مسار التعلّم</div>
            <div className="progress-card">
              <div className="progress-head"><span>تقدمك في الفصول</span><b>{progress}%</b></div>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
              <small>أكملت {done.length} من ٦ فصول</small>
            </div>
            <div className="rail-links">{chapterLinks.map(([id, label], i) => <button key={id} onClick={() => navigate(id)} className={active === id ? 'selected' : ''} data-testid={`nav-${id}`}><span>{i < 7 ? `0${i + 1}` : <CircleHelp size={14} />}</span>{label}{i > 0 && i < 7 && done.includes(id) && <Check size={14} className="rail-check" />}</button>)}</div>
            <div className="rail-safety"><ShieldAlert size={17} /><div><b>السلامة أولًا</b><p>كل التجارب هنا محاكاة ذهنية. لا تنفّذ تفاعلًا حقيقيًا خارج مختبر مجهّز وإشراف معلّم.</p></div></div>
            <div className="rail-credit">إعداد وتنسيق<br /><b>تيم UNV</b></div>
          </aside>

          <div className="main-content">
            {active === 'home' && <HomeDashboard onNavigate={navigate} done={done}/>}
            {active.startsWith('c') && <section className="welcome-strip">
              <div className="welcome-icon"><GraduationCap size={22} /></div>
              <div><b>كيف تستخدم هذا الدفتر؟</b><p>اقرأ الفكرة، جرّب المحاكاة خطوة خطوة، ثم افتح الحل بعد أن تحاول. كل مشاهدة تقودك إلى تفسير.</p></div>
              <button onClick={() => navigate('c1')} aria-label="انتقل إلى الفصل الأول" data-testid="button-welcome-next"><ArrowLeft size={18} /></button>
            </section>}

            {active === 'c1' && <section className="chapter-section" id="c1">
              <ChapterHeading index="١" title={chapterNames[0]} />
              <p className="intro-text">في التحليل النوعي نبدأ بسؤالين: هل يستطيع الحمض أن يزيح حمضًا آخر من ملحه؟ وهل الحمض الناتج متطاير أو غير ثابت بما يكفي ليظهر كغاز أو بخار؟ الحمض الأعلى ثباتًا يزيح غالبًا الأقل ثباتًا من ملحه.</p>
              <div className="stability-visual">
                <div className="stability-title"><Activity size={18} /><span>سلّم ثبات الأحماض</span><small>من الأعلى إلى الأقل</small></div>
                <div className="stability-levels">
                  <div className="level level-stable"><b>ثبات عالٍ</b><span>H₂SO₄ · H₃PO₄</span><small>لا تطلق غازًا في اختبار المجموعة</small></div>
                  <div className="level level-middle"><b>ثبات متوسط</b><span>HCl · HBr · HI · HNO₃</span><small>تُكشف غالبًا بالمركز الساخن</small></div>
                  <div className="level level-fragile"><b>ثبات ضعيف</b><span>H₂CO₃ · H₂SO₃ · H₂S · HNO₂</span><small>تتحلل أو تطلق غازات مع حمض مخفف</small></div>
                </div>
              </div>
              <div className="two-panels">
                <article className="study-panel">
                  <span className="panel-index">01 / الفكرة</span><h3>مجموعتا الكشف</h3>
                  <p><b>حمض الكبريتيك المركز الساخن</b></p><p className="ion-list"><Chem>Cl⁻, Br⁻, I⁻, NO₃⁻</Chem></p>
                  <p><b>حمض مخفف</b></p><p className="ion-list"><Chem>CO₃²⁻, HCO₃⁻, SO₃²⁻, S²⁻, S₂O₃²⁻, NO₂⁻</Chem></p>
                  <p><b>BaCl₂ المائي</b> يرسّب الكبريتات والفوسفات؛ الذوبان في الحمض يميّز بينهما.</p>
                </article>
                <article className="memory-panel"><Sparkles size={18} /><div><b>اربطها في ثوانٍ</b><p>حمض ثابت + ملح حمض أقل ثباتًا ← حمض أقل ثباتًا ← غاز أو بخار يمكن تمييزه بلونه أو بكاشف خاص.</p></div></article>
              </div>
              <LabSimulation id="stability" title="هل أتوقع غازًا؟" intro="اختر ذهنيًا عينة من كل مجموعة، وحدّد الكاشف ثم توقّع ما ستراه." />
              <button className={`complete-button ${done.includes('c1') ? 'complete' : ''}`} onClick={() => toggleDone('c1')} data-testid="button-complete-c1">{done.includes('c1') ? <Check size={16} /> : <BookOpen size={16} />}{done.includes('c1') ? 'تمت مراجعة الفصل' : 'علّم الفصل كمكتمل'}</button>
            </section>}

            {active === 'c2' && <section className="chapter-section" id="c2">
              <ChapterHeading index="٢" title={chapterNames[1]} />
              <p className="intro-text">ملح صلب + حمض كبريتيك مركز + تسخين مضبوط. لا تحفظ اسم الغاز وحده؛ اربط المادة الأولية بالغاز أو البخار، ثم بكاشف التمييز وراسب التأكيد.</p>
              <DataTable headers={['الأنيون', 'ما يحدث مع H₂SO₄ المركز الساخن', 'المشاهدة المميّزة', 'تأكيد AgNO₃']} rows={[
                [<Chem key="a">Cl⁻</Chem>, <>يتكوّن <Chem>HCl(g)</Chem> عديم اللون، صعب الأكسدة.</>, <>ساق مبللة بالنشادر تعطي سحب <Chem>NH₄Cl</Chem> بيضاء.</>, <><Chem>AgCl</Chem> أبيض، يغمق بالضوء ويذوب سريعًا في النشادر.</>],
                [<Chem key="b">Br⁻</Chem>, <>يتكوّن <Chem>HBr</Chem> ثم يتأكسد جزئيًا إلى <Chem>Br₂</Chem> و<Chem>SO₂</Chem>.</>, <>أبخرة البروم برتقالية محمرة؛ النشا يصفر. <Chem>SO₂</Chem> يحوّل ثنائي الكرومات من البرتقالي إلى الأخضر.</>, <><Chem>AgBr</Chem> كريمي، يذوب ببطء في النشادر المركز.</>],
                [<Chem key="c">I⁻</Chem>, <>يتكوّن <Chem>HI</Chem> ويتأكسد بسهولة؛ أبخرة <Chem>I₂</Chem> بنفسجية.</>, <>اليود يزرّق النشا؛ الثيوكبريتات تزيل لون محلوله.</>, <><Chem>AgI</Chem> أصفر، لا يذوب في النشادر المركز.</>],
                [<Chem key="d">NO₃⁻</Chem>, <>يتكوّن <Chem>HNO₃</Chem>، وبالتسخين تظهر أبخرة <Chem>NO₂</Chem> البنية المحمرة.</>, <>النحاس يزيد أبخرة <Chem>NO₂</Chem> ويتكوّن محلول <Chem>Cu(NO₃)₂</Chem> أزرق.</>, <>اختبار الحلقة البنية: <Chem>FeSO₄</Chem> حديث + طبقة حمض مركز بحذر.</>],
              ]} />
              <div className="reaction-pair"><div><span className="eyebrow">معادلات لا غنى عنها</span><Equation>NaCl + H₂SO₄ → NaHSO₄ + HCl↑</Equation><Equation>2HBr + H₂SO₄ → Br₂ + SO₂ + 2H₂O</Equation></div><div><span className="eyebrow">مسارات الأكسدة</span><Equation>2HI + H₂SO₄ → I₂ + SO₂ + 2H₂O</Equation><Equation>Cu + 4HNO₃ → Cu(NO₃)₂ + 2NO₂↑ + 2H₂O</Equation></div></div>
              <aside className="note-callout"><b>اختبار الحلقة البنية</b><p>أضف محلول الحديد الثنائي الحديث تحت طبقة الحمض المركز في المحاكاة فقط. الحلقة تظهر عند الحد الفاصل؛ الرج أو التسخين يزيلها، لذلك لا ترج الأنبوبة قبل القراءة.</p></aside>
              <div className="subhead"><h3>طيف غازات الحمض المخفف</h3><span>المشاهدة تختصر الطريق</span></div>
              <DataTable headers={['الأنيون', 'الناتج مع حمض مخفف', 'العلامة المفيدة']} rows={[
                [<Chem key="a">CO₃²⁻ / HCO₃⁻</Chem>, <Chem>CO₂</Chem>, 'يعكّر ماء الجير؛ وقد تذوب العكارة عند زيادة الغاز.'],
                [<Chem key="b">SO₃²⁻</Chem>, <Chem>SO₂</Chem>, 'غاز مختزل؛ يزيل لون البرمنجنات أو يخضر ثنائي الكرومات.'],
                [<Chem key="c">S²⁻</Chem>, <Chem>H₂S</Chem>, 'يسوّد ورقة أسيتات الرصاص؛ غاز سام لا يُستنشق.'],
                [<Chem key="d">S₂O₃²⁻</Chem>, <><Chem>SO₂ + S(s)</Chem></>, 'معلق كبريتي أصفر مع نقص الكتلة في دورق مفتوح.'],
                [<Chem key="e">NO₂⁻</Chem>, 'أكاسيد نيتروجين من حمض النيتروز غير الثابت', 'مواد مختزلة؛ النتيجة تعتمد على الوسط والظروف.'],
              ]} />
              <div className="quick-memory"><span>بطاقة حفظ</span><p>أبيض مع النشادر = كلوريد <i /> برتقالي محمر + نشا أصفر = بروميد <i /> بنفسجي + نشا أزرق = يوديد <i /> بني محمر + حلقة بنية = نترات</p></div>
              <div className="lab-grid">
                <LabSimulation id="chloride" title="اختبر الكلوريد" intro="تتبّع غاز HCl ثم استخدم نترات الفضة للتأكيد." />
                <LabSimulation id="bromide" title="اختبر البروميد" intro="راقب نواتج الأكسدة الجزئية وميّز البروم عن اليود." />
                <LabSimulation id="iodide" title="اختبر اليوديد" intro="تنبأ بلون بخار اليود، ثم اختبر أثر النشا والثيوكبريتات." />
                <LabSimulation id="nitrate" title="اختبر النترات" intro="اقرأ الحلقة البنية وتعرّف على نواتج تفاعل النحاس." />
              </div>
              <button className={`complete-button ${done.includes('c2') ? 'complete' : ''}`} onClick={() => toggleDone('c2')} data-testid="button-complete-c2">{done.includes('c2') ? <Check size={16} /> : <BookOpen size={16} />}{done.includes('c2') ? 'تمت مراجعة الفصل' : 'علّم الفصل كمكتمل'}</button>
            </section>}

            {active === 'c3' && <section className="chapter-section" id="c3">
              <ChapterHeading index="٣" title={chapterNames[2]} />
              <p className="intro-text">أملاح الفوسفات والكبريتات لا تعطي غازًا في اختبار الحمض المركز المعتاد؛ نكشف عنها في المحاليل المائية بالترسيب.</p>
              <DataTable headers={['الأنيون', 'مع BaCl₂(aq)', 'اختبار الذوبان', 'تأكيد إضافي']} rows={[
                [<Chem key="a">PO₄³⁻</Chem>, <><Chem>Ba₃(PO₄)₂</Chem> راسب أبيض</>, <>يذوب في <Chem>HCl</Chem> المخفف</>, <><Chem>Ag₃PO₄</Chem> أصفر، يذوب في النشادر وحمض النيتريك.</>],
                [<Chem key="b">SO₄²⁻</Chem>, <><Chem>BaSO₄</Chem> راسب أبيض</>, <>لا يذوب في <Chem>HCl</Chem> المخفف</>, <>مع أسيتات الرصاص يتكوّن <Chem>PbSO₄</Chem> أبيض.</>],
              ]} />
              <div className="two-panels">
                <article className="study-panel"><span className="panel-index">معادلتان أساسيتان</span><h3>راسبان متشابهان، سلوكان مختلفان</h3><Equation>3BaCl₂ + 2Na₃PO₄ → Ba₃(PO₄)₂↓ + 6NaCl</Equation><Equation>BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl</Equation></article>
                <article className="step-panel"><span className="panel-index">فصل خليط صلب</span><ol><li>أضف ماءً وحرّك لفصل الأملاح الذائبة إن وجدت.</li><li>أضف HCl المخفف إلى الخليط.</li><li>يذوب فوسفات الباريوم، ويبقى كبريتات الباريوم.</li><li>رشّح؛ الراسب BaSO₄ والفوسفات في الراشح بعد المعالجة.</li></ol></article>
              </div>
              <div className="quick-memory"><span>العلامة الحاسمة</span><p>راسب أبيض يختفي في الحمض = فوسفات الباريوم <i /> راسب أبيض يبقى = كبريتات الباريوم</p></div>
              <LabSimulation id="barium" title="فوسفات أم كبريتات؟" intro="راسب أبيض من BaCl₂، ثم قطرة حمض مخفف: توقّع ما سيبقى." />
              <LabSimulation id="phosphate" title="مسار تأكيد الفوسفات" intro="ابدأ من راسب الباريوم الأبيض، ثم اتبع مسار التحقق الثاني." />
              <LabSimulation id="sulfate" title="مسار تأكيد الكبريتات" intro="اختبر عدم الذوبان ثم أكّد وجود الكبريتات بمشاهدتين." />
              <button className={`complete-button ${done.includes('c3') ? 'complete' : ''}`} onClick={() => toggleDone('c3')} data-testid="button-complete-c3">{done.includes('c3') ? <Check size={16} /> : <BookOpen size={16} />}{done.includes('c3') ? 'تمت مراجعة الفصل' : 'علّم الفصل كمكتمل'}</button>
            </section>}

            {active === 'c4' && <section className="chapter-section" id="c4">
              <ChapterHeading index="٤" title={chapterNames[3]} />
              <p className="intro-text">لا تعتمد على لون الراسب وحده؛ اجمع بين اللون، وأثر الضوء أو التسخين، والذوبان في النشادر أو الحمض.</p>
              <DataTable headers={['الأنيون', 'الراسب', 'اللون والسلوك', 'في النشادر المركز', 'في حمض النيتريك']} rows={[
                [<Chem key="a">Cl⁻</Chem>, <Chem>AgCl</Chem>, 'أبيض؛ يغمق أو يميل للبنفسجي بالضوء', 'يذوب بسرعة', 'لا يذوب عمليًا'],
                [<Chem key="b">Br⁻</Chem>, <Chem>AgBr</Chem>, 'أبيض مصفر (كريمي)؛ يغمق بالضوء', 'يذوب ببطء', 'ليس اختبار التمييز المعتاد'],
                [<Chem key="c">I⁻</Chem>, <Chem>AgI</Chem>, 'أصفر', 'لا يذوب', 'لا يذوب'],
                [<Chem key="d">PO₄³⁻</Chem>, <Chem>Ag₃PO₄</Chem>, 'أصفر', 'يذوب', 'يذوب'],
                [<Chem key="e">SO₃²⁻</Chem>, <Chem>Ag₂SO₃</Chem>, 'أبيض؛ يسود بالتسخين وفق أوراق الدرس', 'لا تعتمد على النشادر منفردًا', 'يتفاعل أو يذوب مع الحمض'],
                [<Chem key="f">S²⁻</Chem>, <Chem>Ag₂S</Chem>, 'أسود مباشرة', 'لا يذوب', 'ليس اختبارًا منزليًا'],
              ]} />
              <div className="two-panels">
                <article className="memory-panel"><TestTube2 size={19} /><div><b>كيف تميّز الراسبين الأصفرين؟</b><p><Chem>Ag₃PO₄</Chem> يذوب في النشادر وحمض النيتريك؛ <Chem>AgI</Chem> لا يذوب فيهما. الماء وحده لا يميّز.</p></div></article>
                <article className="memory-panel memory-sand"><FlaskConical size={19} /><div><b>سُلّم النشادر للهبيدات</b><p><Chem>AgCl</Chem> يذوب سريعًا ← <Chem>AgBr</Chem> ببطء ← <Chem>AgI</Chem> لا يذوب.</p></div></article>
              </div>
              <LabSimulation id="silver" title="شجرة قرار الفضة" intro="أضف AgNO₃، صنّف لون الراسب، ثم اختر اختبار الذوبان المناسب." />
              <div className="lab-grid">
                <LabSimulation id="sulfite" title="الكبريتيت مع الفضة" intro="ميّز الراسب الأبيض الذي يسود بالتسخين عن الراسب الأسود المباشر." />
                <LabSimulation id="sulfide" title="الكبريتيد مع الفضة" intro="اقرأ دليل الراسب الأسود الفوري مع تنبيه السلامة." />
              </div>
              <button className={`complete-button ${done.includes('c4') ? 'complete' : ''}`} onClick={() => toggleDone('c4')} data-testid="button-complete-c4">{done.includes('c4') ? <Check size={16} /> : <BookOpen size={16} />}{done.includes('c4') ? 'تمت مراجعة الفصل' : 'علّم الفصل كمكتمل'}</button>
            </section>}

            {active === 'c5' && <section className="chapter-section" id="c5">
              <ChapterHeading index="٥" title={chapterNames[4]} />
              <p className="intro-text">الكواشف الملونة لا تتغير لمجرد وجود أيون؛ مادة مختزِلة تمنح إلكترونات للكاشف المؤكسد. احفظ لون البداية ثم وجهة الاختزال.</p>
              <div className="redox-board">
                <article className="redox-card permanganate"><span className="color-chip purple" /><span className="eyebrow">الكاشف الأول</span><h3>برمنجنات البوتاسيوم المحمضة</h3><div className="color-change"><b>بنفسجي</b><ArrowLeft size={17} /><b>باهت / عديم اللون</b></div><p><Chem>KMnO₄</Chem> تختزل إلى <Chem>Mn²⁺</Chem>. من المختزِلات: <Chem>SO₂, SO₃²⁻, S₂O₃²⁻, NO₂⁻, NO, Fe²⁺</Chem>.</p></article>
                <article className="redox-card dichromate"><span className="color-chip orange" /><span className="eyebrow">الكاشف الثاني</span><h3>ثنائي كرومات البوتاسيوم المحمضة</h3><div className="color-change"><b>برتقالي</b><ArrowLeft size={17} /><b>أخضر</b></div><p><Chem>K₂Cr₂O₇</Chem> تختزل إلى <Chem>Cr³⁺</Chem>.</p><Equation>Cr₂O₇²⁻ + 3SO₂ + 2H⁺ → 2Cr³⁺ + 3SO₄²⁻ + H₂O</Equation></article>
              </div>
              <div className="quick-memory"><span>احفظ لون البداية</span><p>بنفسجي ← يختفي مع البرمنجنات <i /> برتقالي ← يتحول للأخضر مع ثنائي الكرومات</p></div>
              <LabSimulation id="redox" title="هل الغاز مختزِل؟" intro="اختر كاشفًا ملونًا في ذهنك، ثم فسر التغير الناتج عن غاز مختزِل." />
              <LabSimulation id="sulfite" title="تتبّع انتقال الإلكترونات" intro="راجع كيف يختزل الكبريتيت الكواشف المؤكسدة." />
              <button className={`complete-button ${done.includes('c5') ? 'complete' : ''}`} onClick={() => toggleDone('c5')} data-testid="button-complete-c5">{done.includes('c5') ? <Check size={16} /> : <BookOpen size={16} />}{done.includes('c5') ? 'تمت مراجعة الفصل' : 'علّم الفصل كمكتمل'}</button>
            </section>}

            {active === 'c6' && <section className="chapter-section" id="c6">
              <ChapterHeading index="٦" title={chapterNames[5]} />
              <div className="subhead"><h3>كتلة الراسب مع الزمن</h3><span>تكوّن ثم ذوبان</span></div>
              <p className="intro-text">عند إضافة وفرة من نترات الفضة إلى خليط كلوريد وفوسفات، يتكوّن <Chem>AgCl</Chem> و<Chem>Ag₃PO₄</Chem> فتزداد كتلة الرواسب. عند إضافة وفرة من النشادر تذوب تدريجيًا؛ القمة تمثل أكبر كمية راسب قبل الذوبان.</p>
              <div className="graph-card">
                <svg viewBox="0 0 650 300" role="img" aria-label="رسم منحنى كتلة الراسب مع الزمن">
                  <line x1="60" y1="238" x2="610" y2="238" stroke="#75908c" strokeWidth="2" /><line x1="60" y1="238" x2="60" y2="27" stroke="#75908c" strokeWidth="2" />
                  <text x="337" y="280" textAnchor="middle">الزمن</text><text x="22" y="137" transform="rotate(-90 22 137)" textAnchor="middle">كتلة الراسب</text>
                  <path d="M65 234 L190 187 L310 124 L392 65 L475 132 L580 233" fill="none" stroke="#087f82" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="392" y1="65" x2="392" y2="238" stroke="#d8b55f" strokeDasharray="5 7" />
                  <circle cx={65 + (time / 100) * 515} cy={time < 62 ? 234 - time / 62 * 169 : 65 + ((time - 62) / 38) * 169} r="9" fill="#d9a640" stroke="#fff" strokeWidth="4" />
                  <text x="447" y="43" fontSize="14">AgNO₃ ثم NH₃</text>
                </svg>
                <label htmlFor="time-slider">حرّك الزمن من تكوّن الراسب إلى ذوبانه</label>
                <input id="time-slider" type="range" min="0" max="100" value={time} onChange={(event) => setTime(Number(event.target.value))} data-testid="input-time-slider" />
                <div className="graph-explainer">{time < 62 ? 'الطور الصاعد: يتكوّن AgCl وAg₃PO₄؛ كتلة الراسب تزداد.' : time < 82 ? 'قرب القمة: وصلت كتلة الراسب إلى أكبر قيمة قبل الذوبان.' : 'الطور الهابط: إضافة NH₃ تذيب الرواسب؛ الكتلة تقل نحو الصفر.'}</div>
              </div>
              <div className="subhead"><h3>تجربة الميزان الرقمي</h3><span>الثيوكبريتات في دورق مفتوح</span></div>
              <div className="two-panels">
                <article className="study-panel"><span className="panel-index">المعادلة الأيونية المختصرة</span><Equation>S₂O₃²⁻ + 2H⁺ → SO₂↑ + S(s) + H₂O</Equation><p>أو مع ثيوكبريتات الصوديوم:</p><Equation>Na₂S₂O₃ + 2HCl → 2NaCl + SO₂↑ + S(s) + H₂O</Equation></article>
                <article className="study-panel scale-card"><Activity size={20} /><h3>دليلان مرئيان</h3><p>١. معلق كبريت أصفر. ٢. انخفاض قراءة الميزان لأن <Chem>SO₂</Chem> يغادر الدورق المفتوح.</p><small>في نظام مغلق قد لا تتغير الكتلة الكلية؛ الميزان يقرأ ما بقي على الكفة فقط.</small></article>
              </div>
              <div className="quick-memory"><span>قاعدة الامتحان</span><p>النقصان في ميزان مفتوح = غاز متصاعد هارب <i /> ظهور لون أو راسب = دليل بصري مستقل على حدوث التفاعل</p></div>
              <LabSimulation id="scale" title="توقّع قراءة الميزان" intro="قبل الضغط، قرّر: هل تتوقع ثبات القراءة أم نقصانها؟ وما الدليل المرئي الآخر؟" />
              <LabSimulation id="thiosulfate" title="الثيوكبريتات: غاز وراسب" intro="تابع انطلاق SO₂ وتكوّن الكبريت في الخطوات." />
              <button className={`complete-button ${done.includes('c6') ? 'complete' : ''}`} onClick={() => toggleDone('c6')} data-testid="button-complete-c6">{done.includes('c6') ? <Check size={16} /> : <BookOpen size={16} />}{done.includes('c6') ? 'تمت مراجعة الفصل' : 'علّم الفصل كمكتمل'}</button>
            </section>}

            {active === 'golden' && <GoldenSheet />}
            {active === 'workshop' && <Workshop />}
            {active === 'video' && <VideoLesson />}
            {active === 'practice' && <PracticeSection />}

            {active === 'bank' && <section className="bank-section" id="bank">
              <ChapterHeading index="مصدر" title="بنك الأسئلة الأصلي والحلول المشروحة" />
              <p className="intro-text">المسائل والتدريبات من أوراق الكتاب المرفق، مع الحفاظ على أرقامها المرجعية. حاول أولًا، ثم افتح بطاقة الحل. عند البحث اكتب رقم السؤال أو كلمة من الملاحظة.</p>
              <div className="bank-toolbar">
                <label className="searchbox"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن AgI أو الحلقة البنية أو رقم السؤال…" aria-label="ابحث في بنك الأسئلة" data-testid="input-question-search" />{query && <button onClick={() => setQuery('')} aria-label="مسح البحث"><X size={16} /></button>}</label>
                <label className="filter-select"><span>اعرض</span><select value={filter} onChange={(e) => setFilter(e.target.value)} data-testid="select-question-filter"><option value="all">كل المحتوى</option><option value="essay">الأسئلة المقالية · ٢٨</option><option value="mcq">الاختيار من متعدد · ٦٢</option><option value="terms">مصطلحات · ٢٠</option></select><ChevronDown size={16} /></label>
                <button className="button button-quiet" onClick={() => document.querySelectorAll<HTMLDetailsElement>('.question-card:not(.hidden) details').forEach((el) => { el.open = true; })} data-testid="button-expand-all">افتح الحلول</button>
                <button className="button button-quiet" onClick={() => document.querySelectorAll<HTMLDetailsElement>('.question-card details').forEach((el) => { el.open = false; })} data-testid="button-collapse-all">اطوِ الحلول</button>
              </div>
              <div className="bank-count" aria-live="polite">يعرض {filteredQuestions.length} من {questions.length} بطاقة <span>·</span> من إعداد وتنسيق تيم UNV</div>
              <div className="question-list">
                {filteredQuestions.length ? filteredQuestions.map((item, index) => (
                  <article className="question-card" key={`${item.kind}-${item.n}-${index}`} data-testid={`card-question-${item.kind}-${item.n}`}>
                    <details>
                      <summary><span className="q-number">{item.kind === 'terms' ? `م${item.n}` : item.n}</span><span className="q-copy">{item.q}</span><span className="q-kind">{item.kind === 'essay' ? 'مقالي' : item.kind === 'mcq' ? 'اختيار' : 'مصطلح'}</span><ChevronDown size={16} className="q-chevron" /></summary>
                      <div className="answer-body"><div><b>حلّل وفكّر</b><p>{item.r}</p></div><div><b>الإجابة المشروحة</b><p>{item.a}</p></div><span className="answer-credit">من إعداد وتنسيق تيم UNV</span></div>
                    </details>
                  </article>
                )) : <div className="empty-state"><Search size={25} /><b>ما لقيناش نتيجة مطابقة</b><span>جرّب كلمة أبسط، أو غيّر تصنيف الأسئلة.</span><button onClick={() => { setQuery(''); setFilter('all'); }}>عرض كل البطاقات</button></div>}
              </div>
              <aside className="note-callout science-note"><b>تنبيه علمي من المراجعة</b><p>في بند تفكك حمض النيتروز قد تشمل النواتج NO وNO₂؛ لذلك لا تعتمد إجابة استثناء مطلقة من صورة الاختيارات وحدها. اختبارات الذوبان تتأثر بالتركيز والوسط.</p></aside>
            </section>}

            {active === 'quiz' && <section className="quiz-section" id="quiz">
              <ChapterHeading index="اختبر" title="نفسك قبل الامتحان" />
              <div className="quiz-intro"><div><p>اختبار المراجعة الأصلي المرفق بالدفتر. التدريب الموسّع ذو العشرين سؤالًا في وجهة مستقلة أعلى الصفحة.</p><small>يمكنك تعديل إجاباتك قبل إعادة الاختبار.</small></div><span className="quiz-badge"><GraduationCap size={19} /> {quizItems.length} أسئلة</span></div>
              <div className="quiz-list">
                {quizItems.map((item, index) => (
                  <article className={`quiz-card ${checked[index] ? 'answered' : ''}`} key={index}>
                    <div className="quiz-question"><span>{String(index + 1).padStart(2, '0')}</span><h3>{item.q}</h3></div>
                    <div className="quiz-options">{item.o.map((option, choice) => <label className={answers[index] === choice ? 'chosen' : ''} key={choice}><input type="radio" name={`quiz-${index}`} value={choice} checked={answers[index] === choice} onChange={() => { setAnswers((a) => ({ ...a, [index]: choice })); setChecked((c) => ({ ...c, [index]: false })); setQuizSubmitted(false); }} data-testid={`radio-quiz-${index}-${choice}`} /><span className="radio-mark" />{option}</label>)}</div>
                    {checked[index] && <div className={`quiz-feedback ${answers[index] === item.c ? 'right' : 'wrong'}`}><span>{answers[index] === item.c ? 'إجابة صحيحة' : 'جرّب التفكير من جديد'}</span>{item.e}</div>}
                    <button className="check-answer" onClick={() => setChecked((c) => ({ ...c, [index]: true }))} data-testid={`button-check-quiz-${index}`}>تحقّق من الإجابة <ArrowLeft size={15} /></button>
                  </article>
                ))}
              </div>
              <div className="quiz-footer"><button className="button button-primary" onClick={() => { setChecked(Object.fromEntries(quizItems.map((_, i) => [i, true]))); setQuizSubmitted(true); }} data-testid="button-score-quiz">احسب نتيجتي <Check size={16} /></button><button className="button button-quiet" onClick={() => { setAnswers({}); setChecked({}); setQuizSubmitted(false); }} data-testid="button-reset-quiz"><RotateCcw size={15} /> أعد الاختبار</button>{quizSubmitted && <div className="score-pill" aria-live="polite"><b>{score}</b><span>من {quizItems.length} إجابات صحيحة</span></div>}</div>
              <div className="review-checklist"><h3>قائمة مراجعة سريعة</h3><div>{['أفرق بين HCl وHBr وHI بالمشاهدة التأكيدية.', 'أشرح اختبار الحلقة البنية وأعرف متى تزول.', 'أميز BaSO₄ من Ba₃(PO₄)₂ بالحمض المخفف.', 'أميز الراسبين الأصفرين AgI وAg₃PO₄.', 'أفسر زوال ألوان الكواشف وقراءة الميزان.'].map((label, i) => <label key={i}><input type="checkbox" data-testid={`checklist-${i}`} /><span>{label}</span></label>)}</div></div>
            </section>}

            {active !== 'home' && <footer className="page-footer">
              <div className="footer-symbol"><Atom size={22} /></div>
              <div><b>التحليل الكيميائي الوصفي</b><p>دفتر مراجعة تفاعلي · الصف الثالث الثانوي</p></div>
              <span>من إعداد وتنسيق تيم UNV</span>
              <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="العودة إلى الأعلى" data-testid="button-back-top"><ArrowUp size={18} /></button>
            </footer>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

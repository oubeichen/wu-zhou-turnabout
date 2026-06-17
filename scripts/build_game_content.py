#!/usr/bin/env python3
"""Build static Ace Attorney-style game data from parsed chapter metadata."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
CHAPTERS_PATH = ROOT / ".john/parsed/wuzetian/chapters.json"
EPUB_PATH = ROOT / ".john/input/武则天正传.epub"
GAME_DIR = ROOT / "game"
DATA_PATH = GAME_DIR / "game-data.js"


CASE_BLUEPRINTS = [
    {
        "id": "case-empress-seat",
        "title": "第一案：皇后宝座的缺口",
        "chapters": [4, 5, 6, 7, 8, 9, 10],
        "theme": "宫廷后位之争、婴儿死亡疑云与元老反对",
        "defendant": "被卷入废后风波的宫人证词",
        "location": "立政殿",
        "opponent": "许敬宗",
        "witness": "内廷记录官",
        "witnessPortrait": "survivor",
        "opponentPortrait": "censor",
        "scene": {
            "key": "palace",
            "motif": "后",
            "name": "立政殿内廷",
            "tone": "朱柱、屏风与后位诏书压住整个现场。",
        },
        "goal": "查清婴儿死亡传闻、废后诏书和元老反对为何在同一时间爆发，证明宫人证词不是全部真相。",
        "openingLines": [
            {"speaker": "御前书记", "text": "立政殿外还没散朝，宫人已经被带到门前。她只说自己听见了哭声，却不敢说是谁先喊出了废后。"},
            {"speaker": "辩方", "text": "如果这只是宫里旧怨，为什么奏章、名册和元老的抗议会一起出现？先从现场留下的纸片查起。"},
        ],
        "verdict": "后位案背后的关键不是一件孤证，而是宫廷证词、元老态度和权力收益彼此咬合。",
        "pressure": {
            "danger": {
                "title": "后位风向倒转",
                "body": "若再失误，婴儿死亡疑云会被压成宫闱私怨，元老反对将失去审理入口。",
                "opponentLine": "许敬宗提醒法庭：辩方若无法串起收益链，废后风波只能按旧案归档。",
            },
            "final-warning": {
                "title": "元老席最后通牒",
                "body": "法庭只给最后一次机会。必须证明废后、封后和元老反对不是三件互不相干的事。",
                "opponentLine": "许敬宗已经把案卷推向定论：再无关键证物，所有反对都会被写成旧臣怨言。",
            },
        },
        "turnabout": {
            "title": "后位链条反转",
            "body": "关键证物把私怨、继承与元老反对重新串起，法庭不得不承认后位案不是孤立宫闱传闻。",
            "opponentLine": "许敬宗的定论被迫后退：几件证物一对上，旧臣的沉默就不再像简单怨言。",
        },
        "branch": {
            "revealLabel": "后位诏书背后的署名",
            "triggerPress": "对方越说一切都是旧规矩，越要问清楚是谁把废后的话写进奏章。",
            "hiddenText": "立后的文书只是照旧例写成，没有人主动把元老反对压下去。",
            "hiddenPress": "这句把写奏章的人藏起来了。人物档案能说明谁在替新说法背书。",
        },
    },
    {
        "id": "case-crown-shadow",
        "title": "第二案：东宫阴影",
        "chapters": [19, 20, 21, 22, 23],
        "theme": "太子处境、皇子命运与高宗末期权力交接",
        "defendant": "东宫旧臣",
        "location": "东宫廊下",
        "opponent": "宫廷书记官",
        "witness": "邠王守礼",
        "witnessPortrait": "survivor",
        "opponentPortrait": "censor",
        "scene": {
            "key": "east-palace",
            "motif": "储",
            "name": "东宫廊影",
            "tone": "长廊与灯影把储位不安拉成长线。",
        },
        "goal": "查明东宫旧臣为何被推上审判席，找出皇子待遇、高宗病势和储位传闻之间的联系。",
        "openingLines": [
            {"speaker": "宫廷书记官", "text": "东宫廊下的灯一夜没灭。旧臣说自己只是护送文书，却被指成搅乱储位的人。"},
            {"speaker": "辩方", "text": "太子之争不能只听一句‘家事’。先确认哪些记录被改写，谁会因为改写受益。"},
        ],
        "verdict": "继承危机不是突然爆发，而是从皇子待遇、储位摇摆和高宗病势中逐步形成。",
        "pressure": {
            "danger": {
                "title": "东宫记录锁死",
                "body": "再错一步，东宫旧臣会被定为借储位生乱，皇子们被怎样安排也会被一笔带过。",
                "opponentLine": "书记官把笔停在储位二字上：辩方若不能证明记录被放大，东宫只能自担其罪。",
            },
            "final-warning": {
                "title": "储位案最后通牒",
                "body": "法庭已接近维持旧记录。必须把皇子待遇、高宗病势和叙事口径连成一线。",
                "opponentLine": "书记官请法庭封卷：没有更强证据，所谓朝局风险只是东宫旧臣的自辩。",
            },
        },
        "turnabout": {
            "title": "东宫叙事逆转",
            "body": "正确记录把皇子待遇、高宗病势和书写口径接上，东宫不再只是家庭风波。",
            "opponentLine": "书记官的封卷请求被打断：储位风险已经从旧臣自辩变成朝局证据。",
        },
        "branch": {
            "revealLabel": "东宫记录的改写人",
            "triggerPress": "只说储位会自然交接，正好遮住了谁整理记录、谁借记录说话。",
            "hiddenText": "东宫风波只是皇子命运起落，书记官没有把小事写成大案。",
            "hiddenPress": "这句把书记官说成旁观者，但人物档案显示他一直在挑选该留下哪些话。",
        },
        "trap": {
            "evidenceIndex": 0,
            "notice": "东宫旧账反制",
            "risk": "这份旧账只能说明东宫有人害怕，不能单独证明记录被人改写。",
            "feedback": "书记官抓住辩方只谈旧账的漏洞：旧账只能说明东宫不安，不能直接证明有人把不安写成罪名。",
        },
    },
    {
        "id": "case-rebellion-box",
        "title": "第三案：告密铜匦",
        "chapters": [24, 25, 26, 27, 28, 29, 30, 31],
        "theme": "女皇登基、徐敬业起兵、告密制度与酷吏政治",
        "defendant": "被告发的李唐旧臣",
        "location": "洛阳明堂前",
        "opponent": "来俊臣",
        "witness": "告密人",
        "witnessPortrait": "censor",
        "opponentPortrait": "censor",
        "scene": {
            "key": "bronze-urn",
            "motif": "匦",
            "name": "明堂铜匦",
            "tone": "铜匦、告密札与洛阳广场的回声交织成压力。",
        },
        "goal": "查清告密铜匦里的投书如何从一张纸变成一场大案，救下被告发的李唐旧臣。",
        "openingLines": [
            {"speaker": "告密人", "text": "明堂前的铜匦刚被打开，一张投书就被当成铁证。被告旧臣连看一眼纸条的机会都没有。"},
            {"speaker": "辩方", "text": "投书只是开头。真正要查的是谁接过它、谁添了罪名、谁把恐惧带进法庭。"},
        ],
        "verdict": "告密制度把疑惧变成案件原料，酷吏再把案件加工成威慑。",
        "pressure": {
            "danger": {
                "title": "铜匦回声压庭",
                "body": "再失误，告密原札会被直接当成罪证，酷吏加工案件的环节将脱离审判。",
                "opponentLine": "来俊臣顺势追问：辩方若只否认告密，法庭就只能相信铜匦已经说完真相。",
            },
            "final-warning": {
                "title": "酷吏定案在即",
                "body": "法庭只剩最后耐心。必须指出告密如何被酷吏加工成威慑机器。",
                "opponentLine": "来俊臣要求立刻定案：再拿不出加工链条，旧臣之罪就由铜匦原札坐实。",
            },
        },
        "turnabout": {
            "title": "告密机器逆转",
            "body": "证物把投书入口和酷吏加工分开，铜匦不再能独自替案件定罪。",
            "opponentLine": "来俊臣的定案请求被压回原点：告密原札只是材料，真正的威慑来自加工链条。",
        },
        "branch": {
            "revealLabel": "铜匦告密后的加工者",
            "triggerPress": "告密札只是入口，真正该问的是谁把一张纸变成一场大案。",
            "hiddenText": "铜匦收来的告密天然可信，来俊臣只是照章转呈，没有添油加醋。",
            "hiddenPress": "这句假装酷吏只是传声筒。人物档案能证明他一直在把恐惧做成案子。",
        },
        "trap": {
            "evidenceIndex": 0,
            "notice": "告密原札反制",
            "risk": "这份原札只能证明有人投书，不能直接证明来俊臣后来做了什么。",
            "feedback": "来俊臣顺势把焦点推回告密原札：只证明有人投书，反而让酷吏加工案件的关键责任暂时脱身。",
        },
    },
    {
        "id": "case-urn",
        "title": "第四案：请君入瓮",
        "chapters": [36, 37, 38, 39, 40, 41],
        "theme": "酷吏反噬、狄仁杰与魏元忠、继承争议",
        "defendant": "狄仁杰",
        "location": "御史台审讯室",
        "opponent": "周兴",
        "witness": "魏元忠",
        "witnessPortrait": "minister",
        "opponentPortrait": "censor",
        "scene": {
            "key": "censorate",
            "motif": "瓮",
            "name": "御史台暗室",
            "tone": "审讯室、刑具阴影与反噬逻辑都摆在同一张案上。",
        },
        "goal": "查明狄仁杰供词为何前后不合，证明御史台的审讯手段正在反咬办案者自己。",
        "openingLines": [
            {"speaker": "周兴", "text": "御史台暗室里摆着一口空瓮。周兴说供词已经签下，狄仁杰再辩也无用。"},
            {"speaker": "辩方", "text": "供词太整齐反而可疑。先找出逼供留下的缝隙，再让审讯者解释自己的做法。"},
        ],
        "verdict": "真正被审判的是酷吏政治：它能制造恐惧，却无法长期制造合法性。",
        "pressure": {
            "danger": {
                "title": "瓮中反噬临界",
                "body": "再错一步，逼供术会被包装成正常问案，狄仁杰的翻案入口将被关闭。",
                "opponentLine": "周兴把供词推回案上：辩方若证明不了制度反噬，御史台流程仍可压过一切。",
            },
            "final-warning": {
                "title": "御史台最后警告",
                "body": "法庭准备接受酷吏流程。必须用证物证明逼供技术已经吞噬自己的合法性。",
                "opponentLine": "周兴请法庭维持供词：再无反噬证据，狄仁杰只能留在瓮中。",
            },
        },
        "turnabout": {
            "title": "瓮口反开",
            "body": "证物证明逼供术已经吞噬自己的程序，酷吏流程反而成为翻案入口。",
            "opponentLine": "周兴的供词压制被反噬：御史台流程越完整，越证明酷吏政治正在失控。",
        },
        "branch": {
            "revealLabel": "瓮中审讯的设计者",
            "triggerPress": "审讯越说得像普通问案，越要追问是谁设计了那口瓮。",
            "hiddenText": "御史台只是按旧例问案，周兴没有把逼供术当成办案诀窍。",
            "hiddenPress": "这句把逼供说成惯例。人物档案正好能指出设计者是谁。",
        },
        "trap": {
            "evidenceIndex": 2,
            "notice": "酷吏话术反制",
            "risk": "这份供词只能指出一处破绽，不能直接证明逼供办法已经害到办案者自己。",
            "feedback": "周兴把辩方引向单个供词破绽：供词可疑还不够，必须拿出能说明逼供办法反咬自己的证物。",
        },
    },
    {
        "id": "case-half-hour-coup",
        "title": "最终案：半小时政变",
        "chapters": [42, 43, 44, 45],
        "theme": "张氏兄弟、莫须有罪名与神龙政变",
        "defendant": "被迫沉默的宫廷证人",
        "location": "迎仙宫夜门",
        "opponent": "张易之",
        "witness": "玄宗旧部",
        "witnessPortrait": "survivor",
        "opponentPortrait": "favorite",
        "scene": {
            "key": "night-gate",
            "motif": "变",
            "name": "迎仙宫夜门",
            "tone": "夜门、禁军脚步和半小时的沉默压缩成最后现场。",
        },
        "goal": "查明迎仙宫夜门半小时内发生了什么，说明张氏兄弟、莫须有罪名和神龙政变怎样连到一起。",
        "openingLines": [
            {"speaker": "玄宗旧部", "text": "夜门被撞开的那一刻，宫里只剩急促脚步。证人说半小时足够改朝，却说不清罪名从何而来。"},
            {"speaker": "辩方", "text": "半小时不是空白。谁被保护、谁被推出去、谁突然失去耐心，都藏在这段时间里。"},
        ],
        "verdict": "政变看似短促，实则由长期积累的宫廷不满、继承压力和近臣失控共同推成。",
        "pressure": {
            "danger": {
                "title": "夜门倒计时",
                "body": "再失误，半小时政变会被写成偶发夜变，张氏兄弟与合法性危机的联系会断开。",
                "opponentLine": "张易之抓住沉默逼问：辩方若无法证明临界点，夜门只是一场无源风波。",
            },
            "final-warning": {
                "title": "半小时即将封卷",
                "body": "最后庭审只剩一次翻盘窗口。必须说明宠幸、朝臣耐心和禁军行动怎样汇成政变。",
                "opponentLine": "张易之催促封卷：再无决定性证物，半小时只会成为反对者的借口。",
            },
        },
        "turnabout": {
            "title": "夜门逆转开锁",
            "body": "关键证物把宠幸、朝臣耐心和禁军行动压到同一刻，半小时不再是偶发夜变。",
            "opponentLine": "张易之无法再把沉默说成空白：夜门时间已经成为合法性崩塌的证词。",
        },
        "branch": {
            "revealLabel": "夜门沉默的受益者",
            "triggerPress": "半小时的沉默不是空白，而是在掩护谁从宠臣变成众矢之的。",
            "hiddenText": "迎仙宫夜门的沉默与张易之无关，他只是被局势裹挟的旁观者。",
            "hiddenPress": "这句把最大受益者说成旁观者。人物档案能指出沉默指向谁。",
        },
        "trap": {
            "evidenceIndex": 0,
            "notice": "夜门时间反制",
            "risk": "这份时间线只能证明行动很快，不能直接说明罪名是谁编出来的。",
            "feedback": "张易之抓住辩方只谈夜门时间的弱点：半小时本身只能证明行动迅速，不能直接说明罪名如何被制造。",
        },
    },
]


def load_chapters() -> list[dict[str, object]]:
    return json.loads(CHAPTERS_PATH.read_text(encoding="utf-8"))


def chapter_lookup(chapters: list[dict[str, object]]) -> dict[int, dict[str, object]]:
    return {int(chapter["number"]): chapter for chapter in chapters}


EVIDENCE_KITS = {
    "case-empress-seat": [
        {
            "name": "破损的后位奏章",
            "type": "宫中文书",
            "summary": "奏章边角被撕掉，剩下的字还看得出有人急着把后位之争写成正式决定。",
            "detail": "纸面上先写的是宫中传闻，后半段却突然转向废后和立后。它能说明这场风波不是一句闲话就结束的事。",
            "use": "反驳把废后说成单纯私怨的证词。",
        },
        {
            "name": "摇篮旁的值夜签",
            "type": "现场记录",
            "summary": "值夜签上有涂改，说明婴儿死亡那晚有人反复改过在场名单。",
            "detail": "名单里少了一个关键时辰，却多出后来才补上的宫人姓名。证人如果只说自己听来的传闻，这张签能逼他回到现场。",
            "use": "追问死亡传闻到底来自亲眼所见，还是事后补写。",
        },
        {
            "name": "密封的内廷名册",
            "type": "人物名单",
            "summary": "名册把后宫、外戚和当值官员列在一起，封口处有新蜡。",
            "detail": "普通宫事不会把这些人同时列入一册。它提示玩家：谁在场、谁被调走，往往比一句证词更可靠。",
            "use": "说明后位变化牵动的不只是宫人之间的怨气。",
        },
        {
            "name": "元老联名折",
            "type": "朝臣文书",
            "summary": "几名元老的名字被圈出，旁边写着“不可轻改”。",
            "detail": "这份折子不是替某个宫人喊冤，而是在反对后位突然改变。证词若说朝中没人介意，就可以拿它反击。",
            "use": "反驳“朝廷只按公开事实办事”的说法。",
        },
        {
            "name": "染墨的封后诏稿",
            "type": "诏书草稿",
            "summary": "诏稿上同时有删改和催办痕迹，说明结果早在庭上解释前就被推动。",
            "detail": "墨迹盖住了几个反对者的名字，却保留了新后的称号。它能把婴儿疑云、废后和封后串到同一条线上。",
            "use": "用于后段庭审，说明有人希望尽快让后位尘埃落定。",
        },
    ],
    "case-crown-shadow": [
        {
            "name": "东宫旧账册",
            "type": "东宫记录",
            "summary": "账册里记着东宫开销和侍从调动，几处日期被重写。",
            "detail": "它只能证明东宫长期不安，不能单独证明有人把不安写成罪名。用早了会被对手抓住。",
            "use": "作为调查线索，提醒玩家东宫旧事需要更多证据支撑。",
        },
        {
            "name": "太子问安笺",
            "type": "私人书信",
            "summary": "问安笺语气恭顺，却被批注成“别有用心”。",
            "detail": "同一张纸，亲属问候可以被写成储位试探。它能说明证词如果只说东宫旧臣生事，并不可靠。",
            "use": "反驳把东宫风波说成单个旧臣惹事的证词。",
        },
        {
            "name": "密封的皇子名册",
            "type": "人物名单",
            "summary": "名册把几位皇子的待遇差别列得很细，封条却被重新贴过。",
            "detail": "谁能见驾、谁被调离、谁只能等消息，都被写在同一页。它让继承问题变得具体可查。",
            "use": "追问皇子待遇是否只是家事。",
        },
        {
            "name": "病榻旁的传位记录",
            "type": "宫廷记录",
            "summary": "高宗病中传话的记录前后不一致，有一段被换过纸。",
            "detail": "证人若说公开记录已经足够，这份记录能指出：记录本身也可能被人整理过。",
            "use": "反驳“没有人改写风险”的说法。",
        },
        {
            "name": "折角的遗诏副本",
            "type": "诏令副本",
            "summary": "副本折角处夹着东宫旧臣的名字，像是被人反复翻到那一页。",
            "detail": "它把病势、储位和旧臣处境放在一起，让玩家看到为什么一个旧臣会突然成了被告。",
            "use": "用于说明东宫旧臣不是凭空被推上审判席。",
        },
    ],
    "case-rebellion-box": [
        {
            "name": "铜匦里的告密原札",
            "type": "告密投书",
            "summary": "原札只有短短几行，指名旧臣有异心，却没有写出亲眼所见。",
            "detail": "它能证明有人投书，但不能证明来俊臣之后怎样扩大案情。用它直接定案会很危险。",
            "use": "作为起点，提醒玩家投书不等于真相。",
        },
        {
            "name": "讨武檄文残页",
            "type": "公开文告",
            "summary": "残页上写满激烈词句，边缘还有官府重新标注的罪名。",
            "detail": "檄文和告密被放在一起后，普通旧臣也容易被拖进叛乱阴影里。",
            "use": "反驳把被告直接等同叛乱者的证词。",
        },
        {
            "name": "洛阳街口榜文",
            "type": "告示",
            "summary": "榜文把投书内容贴到街口，路人批注已经把传闻当成定罪。",
            "detail": "它让玩家看到恐惧是怎样扩散的：先有投书，再有榜文，最后人人都不敢替被告说话。",
            "use": "追问公开说法是否真的可靠。",
        },
        {
            "name": "酷吏审讯名册",
            "type": "审讯记录",
            "summary": "名册里有相同笔迹补上的口供，几名证人的说法像被同一人改过。",
            "detail": "这份证物能把责任从投书人转到审讯者身上：案子不是自己长大的，是被人办大的。",
            "use": "反驳“来俊臣只是照章转呈”的说法。",
        },
        {
            "name": "夜半加印的缉捕令",
            "type": "官府命令",
            "summary": "缉捕令在夜里加印，人数从一人变成一串旧臣。",
            "detail": "它显示告密案从一张纸扩成一张网。证人若说只是按原札办事，这张命令能戳破。",
            "use": "用于说明告密被人加工成大案。",
        },
    ],
    "case-urn": [
        {
            "name": "瓮口烙痕",
            "type": "审讯物证",
            "summary": "空瓮边缘有新烙痕，和周兴描述的审讯办法对得上。",
            "detail": "它让传说中的逼供办法变成可见物件：不是吓唬人的故事，而是现场留下的工具。",
            "use": "追问审讯者是否真的只是在普通问案。",
        },
        {
            "name": "狄仁杰亲笔供状",
            "type": "供词",
            "summary": "供状字迹前半稳定，后半突然潦草，像是在压力下匆忙签下。",
            "detail": "供词看似完整，却留下了手抖、停笔和补字的痕迹。它能让玩家怀疑供词是否自愿。",
            "use": "反驳把狄仁杰供词当成铁证的说法。",
        },
        {
            "name": "御史台口供副本",
            "type": "供词副本",
            "summary": "副本能指出个别破绽，但只盯着它会被周兴带偏。",
            "detail": "这份副本说明供词可疑，却不足以解释逼供办法怎样反咬办案者。需要搭配更强证物。",
            "use": "作为线索使用，避免在关键处被对手反制。",
        },
        {
            "name": "周兴审讯手册",
            "type": "审讯手册",
            "summary": "手册把问话、恐吓和认罪步骤排成固定流程。",
            "detail": "它能证明问题不在某一句供词，而在办案者把恐吓当成了办法。周兴若装作按旧例问案，就用它反击。",
            "use": "反驳“御史台只是普通问案”的说法。",
        },
        {
            "name": "魏元忠求援札",
            "type": "私人札记",
            "summary": "札记里写着狄仁杰案外还有继承争议，许多人因此不敢开口。",
            "detail": "它把审讯室外的恐惧带进法庭：沉默不是默认有罪，而是没人敢说话。",
            "use": "用于说明酷吏办法会让真实证词消失。",
        },
    ],
    "case-half-hour-coup": [
        {
            "name": "夜门更漏牌",
            "type": "时间记录",
            "summary": "更漏牌记下夜门开启的时辰，半小时内连换三道口令。",
            "detail": "它只能证明行动很快，不能单独证明罪名从何而来。太早使用会被张易之反咬。",
            "use": "作为时间线线索，提醒玩家还要找罪名来源。",
        },
        {
            "name": "张氏兄弟赏赐簿",
            "type": "宫廷账册",
            "summary": "赏赐簿上的名字越来越密，旁边夹着几张被抽走的奏报。",
            "detail": "它说明宠幸不是一句闲谈，而是看得见的资源流向。证人若说张易之只是旁观者，可以用它压回去。",
            "use": "反驳张易之与夜门风波无关的说法。",
        },
        {
            "name": "莫须有罪名纸条",
            "type": "罪名草稿",
            "summary": "纸条上先写结论，后补理由，几处词语被反复替换。",
            "detail": "这张纸让玩家看到罪名可能是事后凑出来的。它比单纯的夜门时间更能打到关键。",
            "use": "追问谁在政变前后制造罪名。",
        },
        {
            "name": "禁军换岗令",
            "type": "军令",
            "summary": "换岗令把几队禁军临时调到迎仙宫门外，签押很急。",
            "detail": "公开说法称一切临时发生，但军令显示有人提前准备了路线和人手。",
            "use": "反驳“半小时只是偶然夜变”的说法。",
        },
        {
            "name": "迎仙宫沉默名单",
            "type": "宫门名单",
            "summary": "名单上有几名平日爱发声的朝臣，政变前夜却都没有留下记录。",
            "detail": "沉默也能成为线索：当所有人同时闭嘴，说明耐心已经耗尽，只差一个动手时刻。",
            "use": "用于说明政变不是突然冒出来的。",
        },
    ],
}


FINAL_BOARD_COPY = {
    "case-empress-seat": {
        "name": "后位线索板",
        "summary": "把值夜签、名册、元老折和诏稿贴在一起，能看出废后风波不是一名宫人的私事。",
    },
    "case-crown-shadow": {
        "name": "东宫线索板",
        "summary": "把皇子待遇、病榻传话和遗诏副本排成一线，能看出东宫旧臣为何被推到风口。",
    },
    "case-rebellion-box": {
        "name": "告密流向图",
        "summary": "从铜匦原札到榜文、审讯名册和缉捕令，能看出一张投书怎样变成大案。",
    },
    "case-urn": {
        "name": "瓮中审讯图",
        "summary": "把烙痕、供状和审讯手册放在一起，能看出逼供办法怎样反咬周兴。",
    },
    "case-half-hour-coup": {
        "name": "夜门半小时图",
        "summary": "把更漏牌、赏赐簿、罪名纸条和换岗令连起来，能看出政变不是凭空发生。",
    },
}


def evidence_source(number: int, chapter: dict[str, object]) -> str:
    return f"第{number}章：{chapter['title']}"


def make_evidence(case: dict[str, object], lookup: dict[int, dict[str, object]]) -> list[dict[str, str]]:
    evidence = []
    kit = EVIDENCE_KITS[str(case["id"])]
    for offset, number in enumerate(case["chapters"][:5], start=1):
        chapter = lookup[number]
        item = kit[offset - 1]
        evidence.append(
            {
                "id": f"{case['id']}-ev-{offset}",
                "name": item["name"],
                "type": item["type"],
                "source": evidence_source(number, chapter),
                "summary": item["summary"],
                "detail": item["detail"],
                "use": item["use"],
            }
        )
    board = FINAL_BOARD_COPY[str(case["id"])]
    evidence.append(
        {
            "id": f"{case['id']}-ev-pattern",
            "name": board["name"],
            "type": "推理线索",
            "source": "由本案相关章节归纳",
            "summary": board["summary"],
            "detail": "线索板用红线标出先后顺序、受益者和被推出去承担罪名的人。最后庭审里，如果证人说一切只是巧合，就该拿它出来。",
            "use": "用于最终推理，说明多件证物指向同一个案情走向。",
        }
    )
    evidence.append(
        {
            "id": f"{case['id']}-ev-court-note",
            "name": "庭上追问记录",
            "type": "庭审线索",
            "source": "由庭审追问整理",
            "summary": "证人被追问后露出的破绽，已经由书记写成可出示的庭审记录。",
            "detail": "这不是调查阶段能直接拿到的东西。必须先追问最终证词，让证人承认自己说不清证物之间的关系，记录才会加入法庭档案。",
            "use": "用于最终举证，反驳“这些事只是碰巧连在一起”。",
            "trialOnly": True,
        }
    )
    trap = case.get("trap") or {}
    if trap:
        trap_index = int(trap["evidenceIndex"])
        evidence[trap_index]["counterRisk"] = trap["risk"]
        evidence[trap_index]["counterNotice"] = trap["notice"]
    return evidence


def make_locations(case: dict[str, object], evidence: list[dict[str, str]]) -> list[dict[str, object]]:
    investigation_evidence = [item for item in evidence if not item.get("trialOnly")]
    first = [item["id"] for item in investigation_evidence[:2]]
    second = [item["id"] for item in investigation_evidence[2:4]]
    third = [item["id"] for item in investigation_evidence[4:]]
    return [
        {
            "name": case["location"],
            "description": f"{case['location']}仍留着事发当天的痕迹。先问清谁在场，再查看最显眼的物件。",
            "sceneVariant": "site",
            "visualNote": f"{case['scene']['name']}：{case['scene']['tone']}",
            "evidenceIds": first,
            "talkTopics": [
                {
                    "title": "事发那一刻",
                    "speaker": case["witness"],
                    "text": f"我记得大家都很慌，没人敢把话说满。{case['defendant']}被推出来时，现场还有几份文件没有封好。",
                },
                {
                    "title": "谁没开口",
                    "speaker": "随侍书吏",
                    "text": f"奇怪的是，平日最会表态的人那天都沉默了。要找破绽，别只盯着{case['witness']}说出口的话。",
                },
            ],
            "examineSpots": [
                {
                    "name": "朱漆案几",
                    "text": "案几上压着刚翻过的纸，边角有手汗和折痕。至少有两个人在庭审前抢着看过它们。",
                },
                {
                    "name": "屏风后的影子",
                    "text": "屏风后能听见低声争执。有人不想出面作证，却一直在提醒证人该怎么说。",
                },
            ],
        },
        {
            "name": "史官案牍房",
            "description": "旧记录按日期堆在案几上。把前后几天连起来看，许多“偶然”就没那么偶然。",
            "sceneVariant": "archive",
            "visualNote": "案牍房里有旧账、旁注和被重新装订的纸页。",
            "evidenceIds": second,
            "talkTopics": [
                {
                    "title": "时间顺序",
                    "speaker": "史官",
                    "text": "若证词只说结局，就把前面的动作全抹掉了。按日期读，谁先动手、谁后补话，会清楚很多。",
                },
                {
                    "title": "被改过的字",
                    "speaker": "史官",
                    "text": "别怕墨迹小。很多案子不是输在大事上，而是输在一个被换掉的名字、一句后来补上的罪名。",
                },
            ],
            "examineSpots": [
                {
                    "name": "断裂的竹签",
                    "text": "竹签本来用来排序，却被折断。有人不希望这些纸按原本日期摆出来。",
                },
                {
                    "name": "未干的墨迹",
                    "text": "一段旁注刚写不久：‘先看谁拿到好处，再看罪名落到谁身上。’",
                },
            ],
        },
        {
            "name": "辩护席",
            "description": "把搜到的物件摆到一起，准备在庭上指出证人哪一句说不通。",
            "sceneVariant": "defense",
            "visualNote": "辩护席上铺着证物、人物名牌和一张等待补完的线索板。",
            "evidenceIds": third,
            "talkTopics": [
                {
                    "title": "辩护策略",
                    "speaker": "书记助手",
                    "text": "不要急着反驳每句话。先让证人多说，等他说出‘只是私事’、‘只是巧合’这类绝对话，再出示证物。",
                },
                {
                    "title": "最后一击",
                    "speaker": "书记助手",
                    "text": "当证词说‘这些只是偶然’，就该拿出线索板。单件证物能打一句话，线索板能打整套说法。",
                },
            ],
            "examineSpots": [
                {
                    "name": "空白辩状",
                    "text": "辩状还未落笔。所有证物收齐后，真正的庭审才开始。",
                },
                {
                    "name": "铜铃",
                    "text": "每次举证前，铃声都会提醒你：错一次，信誉就少一分。",
                },
            ],
        },
    ]


def make_timeline(case: dict[str, object], lookup: dict[int, dict[str, object]]) -> list[dict[str, str]]:
    result = []
    for number in case["chapters"]:
        chapter = lookup[number]
        result.append(
            {
                "label": f"卷宗{number}",
                "title": str(chapter["title"]),
                "note": f"与“{case['theme']}”相关的阶段性线索。",
            }
        )
    return result


def make_testimony(case: dict[str, object], evidence: list[dict[str, str]]) -> list[dict[str, object]]:
    contradiction_a = evidence[1]["id"]
    contradiction_b = evidence[3]["id"]
    contradiction_c = evidence[-1]["id"]
    court_note = evidence[-1]["id"]
    branch_id = f"{case['id']}-legality-branch"
    branch = case["branch"]
    trap = case.get("trap") or {}
    trap_evidence = evidence[int(trap["evidenceIndex"])]["id"] if trap else None
    recovery_id = f"{case['id']}-counter-recovery" if trap else None
    return [
        {
            "speaker": case["witness"],
            "title": "证词一：表面原因",
            "mood": "cautious",
            "statements": [
                {
                    "text": "那天乱得很，我只听见旁人说，这是宫里积下的旧怨一下子爆了。",
                    "press": "证人没有说自己亲眼看见什么，只是在重复传闻。继续追问传闻从哪里来。",
                    "wrongEvidenceFeedback": "这句只是传闻入口，还不是最硬的矛盾。等证人把责任说死，再出示证物。",
                    "answerEvidence": None,
                },
                {
                    "text": f"{case['defendant']}只是因为私怨才惹出麻烦，和谁上位、谁失势没有关系。",
                    "press": "证人把责任全推给一个人。拿出能说明事发前后还有别的安排的证物。",
                    "wrongEvidenceFeedback": "这件证物还不能打中“只是私怨”。需要能显示事发前后有人安排、有人受益的证物。",
                    "answerEvidence": contradiction_a,
                    "objection": f"异议成立。{evidence[1]['name']}显示事情发生前后已经有人安排位置和说法，不能只按私人怨气解释。",
                },
                {
                    "text": "我只记得最后的结果，前面有没有人铺路，我真的不清楚。",
                    "press": "这句承认了证人不知道前因。先记下，后面遇到绝对断言再反击。",
                    "wrongEvidenceFeedback": "这句是在提示时间顺序，不是正式矛盾点。证物要留给更绝对的说法。",
                    "answerEvidence": None,
                },
            ],
        },
        {
            "speaker": case["opponent"],
            "title": "证词二：合法性",
            "mood": "aggressive",
            "statements": [
                {
                    "text": "官府记录已经写得很清楚，辩方不必再问是谁整理、是谁补字。",
                    "press": branch["triggerPress"],
                    "unlockStatementId": branch_id,
                    "wrongEvidenceFeedback": "对方正在阻止追问，这时先追问更有用。等他把责任推干净，再用证物。",
                    "answerEvidence": None,
                },
                {
                    "text": branch["hiddenText"],
                    "press": branch["hiddenPress"],
                    "hiddenUntilPressed": branch_id,
                    "revealLabel": branch["revealLabel"],
                    "wrongEvidenceFeedback": "这句藏的是人，不是物。应该查看人物档案，找出谁并非旁观者。",
                    "answerProfile": case["opponent"],
                    "answerEvidence": None,
                    "objection": f"异议成立。{case['opponent']}的人物档案说明他一直在推动这套说法，不能把自己装成旁观者。",
                },
                {
                    "text": "公开贴出来的说法都是真话，没有人借告示、审讯或传闻逼别人改口。",
                    "press": "对方把公开说法当成天然可信。问清这套说法从哪里来、谁把它传出去。",
                    "wrongEvidenceFeedback": "要反驳这句，需要能显示有人借公告、审讯或传闻推动案情的证物。",
                    "counterEvidence": trap_evidence,
                    "counterRecoveryId": recovery_id,
                    "counterNotice": trap.get("notice", ""),
                    "counterFeedback": trap.get("feedback", ""),
                    "counterPenalty": 2 if trap else 0,
                    "answerEvidence": contradiction_b,
                    "objection": f"异议成立。{evidence[3]['name']}显示公开说法背后还有人整理、加压和扩散，证词把关键步骤藏掉了。",
                },
                *(
                    [
                        {
                            "text": f"{case['opponent']}反制后留下了一个缺口：他只证明刚才那件证物不够，却没有解释后续动作是谁做的。",
                            "press": "这句是补救入口。不要再纠缠刚才被抓住的证物，改用真正能说明后续动作的证物。",
                            "hiddenUntilPressed": recovery_id,
                            "revealLabel": "反制后的补救破绽",
                            "optionalRecovery": True,
                            "recoveryCredibility": 1,
                            "wrongEvidenceFeedback": "补救追问需要能说明后续动作的证物，不能再回到刚被反制的那份记录。",
                            "answerEvidence": contradiction_b,
                            "objection": f"补救成立。{evidence[3]['name']}避开刚才的漏洞，直接说明公开说法背后还有人动手整理。",
                        }
                    ]
                    if trap
                    else []
                ),
                {
                    "text": "反正最后赢的一方留下了记录，这就说明前面的判断都没错。",
                    "press": "胜负不能自动证明记录可靠。赢的人也可能改写说法。",
                    "wrongEvidenceFeedback": "这句话很可疑，但它是逻辑偷换，不是本段要击破的核心事实。",
                    "answerEvidence": None,
                },
            ],
        },
        {
            "speaker": "御前书记",
            "title": "证词三：最终推理",
            "mood": "decisive",
            "statements": [
                {
                    "text": "庭上已经听够了证物名字，辩方还没有说明它们到底怎么连在一起。",
                    "press": "这正是最后推理的入口。追问后，把证人承认说不清的地方写成庭审记录。",
                    "pressUnlockEvidence": court_note,
                    "wrongEvidenceFeedback": "这句话是在要求辩方总结，还没形成可击破的断言。先追问，取得庭上追问记录。",
                    "answerEvidence": None,
                },
                {
                    "text": "这些事只是碰巧接在一起，没有同一个受益者，也没有同一个被推出去背罪的人。",
                    "press": "把谁受益、谁沉默、谁背罪放在同一张图上，就能看出它们不是巧合。",
                    "wrongEvidenceFeedback": "单件证物只能说明局部事实。最后一击需要庭上追问后整理出的记录。",
                    "answerEvidence": contradiction_c,
                    "objection": f"异议成立。{evidence[-1]['name']}记录了证人说不清的关键：这些事不是巧合，而是有人受益、有人背罪。",
                },
                {
                    "text": "辩方若不能说清这条线，本庭就维持原判。",
                    "press": "这是最后机会。选择能概括全案的证据。",
                    "wrongEvidenceFeedback": "这是审判压力，不是矛盾本身。把注意力放回上一句的“偶然事件”。",
                    "answerEvidence": None,
                },
            ],
        },
    ]


def make_profiles(cases: list[dict[str, object]]) -> list[dict[str, str]]:
    profiles = [
        {"name": "武则天", "role": "案件核心人物", "portrait": "empress", "note": "所有案件围绕她的权力上升、统治技术与晚年危机展开。"},
        {"name": "狄仁杰", "role": "关键辩方人物", "portrait": "minister", "note": "在酷吏政治与继承争议中维持判断力。"},
        {"name": "来俊臣", "role": "酷吏代表", "portrait": "censor", "note": "象征告密、酷刑和冤案生产机制。"},
        {"name": "张易之", "role": "最终案对手", "portrait": "favorite", "note": "晚年宫廷宠幸与政变导火索之一。"},
    ]
    seen = {profile["name"] for profile in profiles}
    for case in cases:
        for name, role, portrait_key in (
            (case["witness"], "本案证人", "witnessPortrait"),
            (case["opponent"], "本案对手", "opponentPortrait"),
        ):
            if name in seen:
                continue
            profiles.append(
                {
                    "name": str(name),
                    "role": role,
                    "portrait": str(case.get(portrait_key, "survivor")),
                    "note": f"与“{case['theme']}”直接相关，庭审中可能成为拆穿证词责任归属的关键人物。",
                }
            )
            seen.add(name)
    return profiles


def make_pressure_beats(case: dict[str, object]) -> dict[str, dict[str, str]]:
    pressure = case.get("pressure") or {}
    return {
        "danger": {
            "label": "危险",
            "title": pressure.get("danger", {}).get("title", "法庭警戒"),
            "body": pressure.get("danger", {}).get("body", "信誉已经偏低。下一次错误会让对手夺走节奏。"),
            "opponentLine": pressure.get("danger", {}).get("opponentLine", "对手开始催促法庭收束争点。"),
        },
        "final-warning": {
            "label": "最后警告",
            "title": pressure.get("final-warning", {}).get("title", "最后警告"),
            "body": pressure.get("final-warning", {}).get("body", "法官已经准备维持原判。只能选择最能击穿当前证词的记录。"),
            "opponentLine": pressure.get("final-warning", {}).get("opponentLine", "对手要求立刻封卷，辩方只剩最后一次机会。"),
        },
    }


def make_turnabout_beat(case: dict[str, object]) -> dict[str, str]:
    turnabout = case.get("turnabout") or {}
    return {
        "title": turnabout.get("title", "逆转突破"),
        "body": turnabout.get("body", "关键证物扭转庭审方向，法庭重新听取辩方推理。"),
        "opponentLine": turnabout.get("opponentLine", "对手的压迫被迫中断，庭审节奏回到辩方手里。"),
        "recovery": 1,
    }


def build_game_data() -> dict[str, object]:
    chapters = load_chapters()
    lookup = chapter_lookup(chapters)
    cases = []
    for index, blueprint in enumerate(CASE_BLUEPRINTS, start=1):
        evidence = make_evidence(blueprint, lookup)
        public_case = {key: value for key, value in blueprint.items() if key not in {"pressure", "turnabout"}}
        cases.append(
            {
                **public_case,
                "index": index,
                "badEnding": (
                    f"若无法推翻这组证词，{blueprint['theme']}会被写成单一罪名。"
                    f"{blueprint['defendant']}的沉默将成为定案理由，真正该查的人会躲在案卷后面。"
                ),
                "pressureBeats": make_pressure_beats(blueprint),
                "turnaboutBeat": make_turnabout_beat(blueprint),
                "sources": [lookup[number]["title"] for number in blueprint["chapters"]],
                "evidence": evidence,
                "locations": make_locations(blueprint, evidence),
                "timeline": make_timeline(blueprint, lookup),
                "testimony": make_testimony(blueprint, evidence),
            }
        )
    return {
        "title": "武周逆转录",
        "subtitle": "基于《武则天正传》的宫廷法庭推理游戏",
        "source": "《武则天正传》",
        "cases": cases,
        "profiles": make_profiles(cases),
    }


def extract_assets() -> None:
    assets_dir = GAME_DIR / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    with ZipFile(EPUB_PATH) as epub:
        image_names = [
            name
            for name in epub.namelist()
            if name.startswith("OEBPS/Images/") and not name.endswith("/")
        ]
        for image_name in image_names:
            target = assets_dir / Path(image_name).name
            with epub.open(image_name) as source, target.open("wb") as dest:
                shutil.copyfileobj(source, dest)


def main() -> None:
    GAME_DIR.mkdir(parents=True, exist_ok=True)
    extract_assets()
    data = build_game_data()
    DATA_PATH.write_text(
        "window.WUZHOU_GAME_DATA = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )
    print(json.dumps({"success": True, "cases": len(data["cases"]), "data": str(DATA_PATH)}, ensure_ascii=False))


if __name__ == "__main__":
    main()

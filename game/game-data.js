window.WUZHOU_GAME_DATA = {
  "title": "武周逆转录",
  "subtitle": "基于《武则天正传》的宫廷法庭推理游戏",
  "source": "《武则天正传》",
  "cases": [
    {
      "id": "case-empress-seat",
      "title": "第一案：皇后宝座的缺口",
      "chapters": [
        4,
        5,
        6,
        7,
        8,
        9,
        10
      ],
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
        "tone": "朱柱、屏风与后位诏书压住整个现场。"
      },
      "goal": "查清婴儿死亡传闻、废后诏书和元老反对为何在同一时间爆发，证明宫人证词不是全部真相。",
      "menuHook": "立政殿外的哭声刚停，废后的名字已经被人送上案头。宫人跪着，诏稿压着，真正动手的人还没离开帘后。",
      "openingStory": {
        "kicker": "事发当晚",
        "title": "婴儿死讯还没传出宫门，废后的名字已经先进了诏稿。",
        "body": "立政殿外，守门宫人跪在冷砖上，手里还攥着一块值夜签。她说自己只听见哭声，可案几上的诏稿已经替她说完了更可怕的话：废后、封后、元老闭嘴。等案卷递到庭前时，所有人都巴不得这只是一场宫人私怨。",
        "stakes": "只听证词，最弱的人就会背下罪名；纸张一翻，后位到底怎样被人挪开，才会露出来。"
      },
      "introCards": [
        {
          "title": "宫人只敢说哭声",
          "body": "她不敢说出第一个喊“废后”的人，只把那一夜的哭声死死咬在嘴里。"
        },
        {
          "title": "诏稿来得太早",
          "body": "婴儿死讯还没查清，废后的文字已经在案头等着盖下去。"
        },
        {
          "title": "元老反对被压低",
          "body": "朝臣不是没有反对，而是反对声被塞进了案卷最底下。"
        }
      ],
      "sourceStoryItems": [
        {
          "title": "宫门前的哭声",
          "note": "流言从这里开始：有人把婴儿死亡和废后连到一起，却没人敢承认第一句话出自谁口。"
        },
        {
          "title": "值夜签被改",
          "note": "名单上少了一段关键时辰，又多出后来补上的人名。它像一扇没关严的门，露出现场真正的动静。"
        },
        {
          "title": "名册重新封蜡",
          "note": "后宫、外戚和当值官员被放进同一本册子，说明这不是宫人之间的私怨，而是有人在清点站位。"
        },
        {
          "title": "元老终于出声",
          "note": "朝臣们的反对不是替谁哭冤，而是在抗拒后位突然改写。有人急着让他们闭嘴。"
        },
        {
          "title": "诏稿上盖住的名字",
          "note": "墨迹遮住了反对者，却留下新后的称号。结果像是早就写好，只等一个理由送上来。"
        },
        {
          "title": "第一刀落下",
          "note": "风波开始变成惩罚。谁被推出去承罪，谁被留下来受益，线索在这一刻分得最清楚。"
        },
        {
          "title": "宝座终于空出缺口",
          "note": "所有纸张、证词和沉默都指向同一个结局：后位不是自然空出来的，是被一步步挪开的。"
        }
      ],
      "openingLines": [
        {
          "speaker": "御前书记",
          "text": "立政殿外还没散朝，宫人已经被带到门前。她只说自己听见了哭声，却不敢说是谁先喊出了废后。"
        },
        {
          "speaker": "辩方",
          "text": "如果这只是宫里旧怨，奏章、名册和元老的抗议就不会一起堆到案头。有人先替这场哭声写好了去处。"
        },
        {
          "speaker": "许敬宗",
          "text": "宫中旧事最忌捕风捉影。辩方若拿不出纸证，就别让一场哭声惊动朝堂。"
        }
      ],
      "verdict": "后位案背后的关键不是一件孤证，而是宫廷证词、元老态度和权力收益彼此咬合。",
      "branch": {
        "revealLabel": "后位诏书背后的署名",
        "triggerPress": "对方越说一切都是旧规矩，越要问清楚是谁把废后的话写进奏章。",
        "hiddenText": "立后的文书只是照旧例写成，没有人主动把元老反对压下去。",
        "hiddenPress": "他把写奏章的人藏到纸后头了。翻人物档案，看看是谁在替这套新说法撑腰。"
      },
      "index": 1,
      "badEnding": "若无法推翻这组证词，宫廷后位之争、婴儿死亡疑云与元老反对会被写成单一罪名。被卷入废后风波的宫人证词的沉默将成为定案理由，真正该查的人会躲在案卷后面。",
      "pressureBeats": {
        "danger": {
          "label": "危险",
          "title": "后位风向倒转",
          "body": "若再失误，婴儿死亡疑云会被压成宫闱私怨，元老反对将失去审理入口。",
          "opponentLine": "许敬宗提醒法庭：辩方若无法串起收益链，废后风波只能按旧案归档。"
        },
        "final-warning": {
          "label": "最后警告",
          "title": "元老席最后通牒",
          "body": "法庭只给最后一次机会。必须证明废后、封后和元老反对不是三件互不相干的事。",
          "opponentLine": "许敬宗已经把案卷推向定论：再无关键证物，所有反对都会被写成旧臣怨言。"
        }
      },
      "turnaboutBeat": {
        "title": "后位链条反转",
        "body": "关键证物把私怨、继承与元老反对重新串起，法庭不得不承认后位案不是孤立宫闱传闻。",
        "opponentLine": "许敬宗的定论被迫后退：几件证物一对上，旧臣的沉默就不再像简单怨言。",
        "recovery": 1
      },
      "sources": [
        "第四章 乱伦，接近权力中心的第一步",
        "第五章 为了对付那个貌美多姿的妃子",
        "第六章 掐死亲生女儿的收获",
        "第七章 向皇后进攻",
        "第八章 元老重臣的抗议",
        "第九章 开刀",
        "第十章 终于登上皇后宝座"
      ],
      "evidence": [
        {
          "id": "case-empress-seat-ev-1",
          "name": "破损的后位奏章",
          "type": "宫中文书",
          "source": "第4章：第四章 乱伦，接近权力中心的第一步",
          "summary": "奏章缺了一角，剩下的字却很急：哭声还没查清，废后的结论已经往纸上赶。",
          "detail": "前半页还像宫中传闻，后半页忽然变成废后、立后。像有人等不及事实查完，先把结果写好。",
          "use": "它咬住的，是谁把哭声一路送进了后位文书。"
        },
        {
          "id": "case-empress-seat-ev-2",
          "name": "摇篮旁的值夜签",
          "type": "现场记录",
          "source": "第5章：第五章 为了对付那个貌美多姿的妃子",
          "summary": "值夜签被刮过一层，摇篮旁最要紧的时辰反而最模糊。",
          "detail": "一个名字被擦淡，另一个名字后来补上。木签很小，却把“谁在场”这个问题钉回了现场。",
          "use": "它把人重新拖回摇篮旁：那晚到底是谁靠近过孩子。"
        },
        {
          "id": "case-empress-seat-ev-3",
          "name": "密封的内廷名册",
          "type": "人物名单",
          "source": "第6章：第六章 掐死亲生女儿的收获",
          "summary": "名册重新封蜡，后宫、外戚和值夜人被压在同一本册子里。",
          "detail": "普通宫务不会这样点名。有人不是在查一名宫人，而是在清点整座后宫该站哪边。",
          "use": "它说明被卷进来的，从来不止一个宫人。"
        },
        {
          "id": "case-empress-seat-ev-4",
          "name": "元老联名折",
          "type": "朝臣文书",
          "source": "第7章：第七章 向皇后进攻",
          "summary": "元老折子上有几个名字被重重圈住，旁边的墨字写着“不可轻改”。",
          "detail": "这不是求情信，是朝臣对后位变化的刹车。折子被压得越深，越说明有人急着让它失声。",
          "use": "它让那些被压住的反对声重新有了名字。"
        },
        {
          "id": "case-empress-seat-ev-5",
          "name": "染墨的封后诏稿",
          "type": "诏书草稿",
          "source": "第8章：第八章 元老重臣的抗议",
          "summary": "封后诏稿上有催办痕迹，像结果已经等在案前，只缺一个说得过去的理由。",
          "detail": "几处反对者名字被墨盖住，新后称号却保留得很清楚。纸没有说谎，写纸的人太着急了。",
          "use": "它把婴儿疑云、废后和封后压成了同一条线。"
        },
        {
          "id": "case-empress-seat-ev-pattern",
          "name": "后位线索板",
          "type": "推理线索",
          "source": "由本案相关章节归纳",
          "summary": "把值夜签、名册、元老折和诏稿贴在一起，能看出废后风波不是一名宫人的私事。",
          "detail": "红线从摇篮旁绕到元老折，再停在封后诏稿上。宫人只是站在最前面，真正得利的人躲在纸后。",
          "use": "它把得利的人、闭嘴的人和背罪的人压回了同一张案桌。"
        },
        {
          "id": "case-empress-seat-ev-court-note",
          "name": "庭上追问记录",
          "type": "庭审线索",
          "source": "由庭审追问整理",
          "summary": "记录官被追问后承认：哭声、值夜签和诏稿之间，他说不出谁先谁后。",
          "detail": "这份庭上记录不是新证物，而是证人当场露出的空白。它把宫人私怨的说法撕开了一道口子。",
          "use": "它把宫人背罪、后位得利和元老失声压成了一件事。",
          "trialOnly": true
        },
        {
          "id": "case-empress-seat-ev-pursuit-note",
          "name": "追击补记：哭声入诏",
          "type": "追击线索",
          "source": "由对照札记追击整理",
          "summary": "记录官被逼到最后，承认哭声传闻进入诏稿前，曾有人先把废后两个字递到案边。",
          "detail": "这份补记写在追击之后：证人没能说出递话的人名，却说出了传闻不是自己走进文书的。",
          "use": "它盯住的，是谁先把哭声写成了后位风向。",
          "trialOnly": true,
          "pursuitOnly": true
        }
      ],
      "locations": [
        {
          "name": "立政殿",
          "description": "立政殿门槛还压着散朝后的灰。宫人们站得很远，像谁靠近那张诏稿，谁就会被拖进婴儿死讯里。",
          "sceneVariant": "site",
          "visualNote": "立政殿内廷：朱柱、屏风与后位诏书压住整个现场。",
          "evidenceIds": [
            "case-empress-seat-ev-1",
            "case-empress-seat-ev-2"
          ],
          "talkTopics": [
            {
              "title": "哭声从哪来",
              "speaker": "内廷记录官",
              "text": "我只写听见哭声，没写是谁喊废后。那两个字太重，落到纸上，就不是宫人能擦掉的了。"
            },
            {
              "title": "谁先退后",
              "speaker": "守门宫人",
              "text": "元老的人还没到，许敬宗身边的书吏先把案几让出来了。像是早知道这里要摆哪一份文书。"
            }
          ],
          "examineSpots": [
            {
              "name": "压着诏稿的镇纸",
              "text": "镇纸底下露出半个“后”字，墨还没完全干。有人不是在记录结果，而是在催结果快点变成事实。"
            },
            {
              "name": "屏风后的绣鞋印",
              "text": "脚印停在能听见殿内争执的位置。证人说自己只在门外，可这里有人站得比门外近得多。"
            }
          ]
        },
        {
          "name": "史官案牍房",
          "description": "案牍房里，后妃名册被重新穿线。新蜡盖住旧孔，却盖不住翻动过的顺序。",
          "sceneVariant": "archive",
          "visualNote": "案牍房里有旧账、旁注和被重新装订的纸页。",
          "evidenceIds": [
            "case-empress-seat-ev-3",
            "case-empress-seat-ev-4"
          ],
          "talkTopics": [
            {
              "title": "名册为何重封",
              "speaker": "老史官",
              "text": "若只是婴儿夭折，翻后妃名册做什么？这册子一重封，宫里谁该站哪边，就都被重新点过名了。"
            },
            {
              "title": "元老折子的去向",
              "speaker": "随侍书吏",
              "text": "折子送来时还烫手，转眼就被压到最底下。不是没人反对，是有人不想让反对先被看见。"
            }
          ],
          "examineSpots": [
            {
              "name": "新蜡封口",
              "text": "封蜡压得很急，边上还有指甲划痕。封口的人像是怕别人马上翻回旧页。"
            },
            {
              "name": "被抽走的一页",
              "text": "页缝里残着细纸毛。缺掉的不是空白页，而是最容易说明当晚谁在场的那一页。"
            }
          ]
        },
        {
          "name": "辩护席",
          "description": "辩护席上摆着值夜签、名册和诏稿。只要顺序排错，许敬宗就能把它们说成互不相干。",
          "sceneVariant": "defense",
          "visualNote": "辩护席上铺着证物、人物名牌和一张等待补完的线索板。",
          "evidenceIds": [
            "case-empress-seat-ev-5",
            "case-empress-seat-ev-pattern"
          ],
          "talkTopics": [
            {
              "title": "诏稿压得太早",
              "speaker": "辩方",
              "text": "诏稿最刺眼，可真正要命的不是它摆在案上，而是哭声、值夜和名册为什么会一起往它身上靠。"
            },
            {
              "title": "宫人为什么闭嘴",
              "speaker": "书记助手",
              "text": "她不是不知道，她是不敢知道。谁的名字一旦从她嘴里出来，她多半就活不到天亮。"
            }
          ],
          "examineSpots": [
            {
              "name": "未落笔的辩状",
              "text": "第一行只写了“哭声不是诏书”。后面空着，等你把谁听见、谁改签、谁封册排成一条线。"
            },
            {
              "name": "折起的元老名单",
              "text": "名单折在最外侧。它不只替宫人留下一口气，也把有人急着让元老闭嘴这件事翻了出来。"
            }
          ]
        }
      ],
      "timeline": [
        {
          "label": "卷宗4",
          "title": "第四章 乱伦，接近权力中心的第一步",
          "note": "与“宫廷后位之争、婴儿死亡疑云与元老反对”相关的阶段性线索。"
        },
        {
          "label": "卷宗5",
          "title": "第五章 为了对付那个貌美多姿的妃子",
          "note": "与“宫廷后位之争、婴儿死亡疑云与元老反对”相关的阶段性线索。"
        },
        {
          "label": "卷宗6",
          "title": "第六章 掐死亲生女儿的收获",
          "note": "与“宫廷后位之争、婴儿死亡疑云与元老反对”相关的阶段性线索。"
        },
        {
          "label": "卷宗7",
          "title": "第七章 向皇后进攻",
          "note": "与“宫廷后位之争、婴儿死亡疑云与元老反对”相关的阶段性线索。"
        },
        {
          "label": "卷宗8",
          "title": "第八章 元老重臣的抗议",
          "note": "与“宫廷后位之争、婴儿死亡疑云与元老反对”相关的阶段性线索。"
        },
        {
          "label": "卷宗9",
          "title": "第九章 开刀",
          "note": "与“宫廷后位之争、婴儿死亡疑云与元老反对”相关的阶段性线索。"
        },
        {
          "label": "卷宗10",
          "title": "第十章 终于登上皇后宝座",
          "note": "与“宫廷后位之争、婴儿死亡疑云与元老反对”相关的阶段性线索。"
        }
      ],
      "testimony": [
        {
          "speaker": "内廷记录官",
          "title": "证词一：表面原因",
          "mood": "cautious",
          "statements": [
            {
              "text": "我在殿门外听见哭声，随后就有人说这是废后旧怨。宫里这种话，传得比脚步还快。",
              "press": "记录官把哭声说得很轻，却把最先喊出“废后”的人藏了起来。当晚那口气，他还没吐干净。",
              "wrongEvidenceFeedback": "眼下还只是风声。案上的纸还没碰到真正伤人的地方。",
              "answerEvidence": null
            },
            {
              "text": "那名宫人本来就怨气深，婴儿夭折也好、废后传闻也好，都和后位更替没有关系。",
              "press": "他急着把风波全压到宫人身上，倒把那张动过手脚的名单晾在了案外。",
              "wrongEvidenceFeedback": "这份记录还够不着“宫人私怨”那层说法。当晚谁在场、谁被挪走，还没被它扯出来。",
              "answerEvidence": "case-empress-seat-ev-2",
              "pursuitUnlockStatementId": "case-empress-seat-pursuit-surface",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。摇篮旁的值夜签说明当晚在场名单被改过，废后传闻不是一名宫人自己能推成的事。"
            },
            {
              "text": "记录官低声补了一句：哭声传到案前时，废后两个字已经夹在里面了。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-empress-seat-pursuit-surface",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-empress-seat-ev-pursuit-note",
              "objection": "异议成立。追击补记：哭声入诏已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "至于谁后来升上去、谁被排出去，我一个记录官只照听见的话写，不敢多想。",
              "press": "他嘴上说不敢多想，心里却早知道这份文书不是自己长出来的。",
              "wrongEvidenceFeedback": "这里只露了一道缝，还没碰到案子最硬的骨头。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "许敬宗",
          "title": "证词二：合法性",
          "mood": "aggressive",
          "statements": [
            {
              "text": "后位文书有印有押，辩方再问谁补字、谁压折子，只是在给旧臣找借口。",
              "press": "对方越说一切都是旧规矩，越要问清楚是谁把废后的话写进奏章。",
              "unlockStatementId": "case-empress-seat-legality-branch",
              "wrongEvidenceFeedback": "许敬宗正在挡住追问。先按住他，让隐藏的署名问题浮出来。",
              "answerEvidence": null
            },
            {
              "text": "立后的文书只是照旧例写成，没有人主动把元老反对压下去。",
              "press": "他把写奏章的人藏到纸后头了。翻人物档案，看看是谁在替这套新说法撑腰。",
              "hiddenUntilPressed": "case-empress-seat-legality-branch",
              "revealLabel": "后位诏书背后的署名",
              "wrongEvidenceFeedback": "这里要打的是“谁不是旁观者”。证物不如人物档案直接。",
              "answerProfile": "许敬宗",
              "answerEvidence": null,
              "objection": "异议成立。许敬宗不是旁观者，他正是把废后说法写进正式文书的人。"
            },
            {
              "text": "元老折子没有改变结果，说明朝中本来就没人真正反对这次后位安排。",
              "press": "他把折子从证据变成了废纸。问清折子为什么被压下去，再用反对记录反击。",
              "wrongEvidenceFeedback": "要反驳“没人真正反对”，需要能显示元老意见被整理和压下的证物。",
              "counterEvidence": null,
              "counterRecoveryId": null,
              "counterNotice": "",
              "counterFeedback": "",
              "counterPenalty": 0,
              "answerEvidence": "case-empress-seat-ev-4",
              "pursuitUnlockStatementId": "case-empress-seat-pursuit-legality",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。元老联名折留下了元老反对的痕迹，许敬宗不能把被压下的声音说成不存在。"
            },
            {
              "text": "许敬宗说漏了嘴：元老折子不是没到，是到了以后被人压在诏稿下面。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-empress-seat-pursuit-legality",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-empress-seat-ev-pursuit-note",
              "objection": "异议成立。追击补记：哭声入诏已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "最后写进诏书的，就是法庭该承认的事实。纸上已经定了，辩方何必再翻旧账？",
              "press": "许敬宗把结果当成原因。胜出者留下的纸，正需要反过来追问是谁推动它胜出。",
              "wrongEvidenceFeedback": "这番话滑得很，可真正伤人的地方还不在这里。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "御前书记",
          "title": "证词三：最终推理",
          "mood": "decisive",
          "statements": [
            {
              "text": "哭声、名册、折子、诏稿，辩方若只会一个个念名字，本庭听不到它们之间的线。",
              "press": "他说案卷只是一堆散纸，可哭声、名册、折子和诏稿早就挤到同一条线上了。",
              "pressUnlockEvidence": "case-empress-seat-ev-court-note",
              "wrongEvidenceFeedback": "案上的线还没拢成一处，这份记录压不住整场风波。",
              "answerEvidence": null
            },
            {
              "text": "这些纸只是凑巧落在同一案里。没有同一个受益者，也没有同一个人被推出去挡刀。",
              "press": "受益的人、沉默的人、背罪的人一站齐，后位案就不可能只是巧合。",
              "wrongEvidenceFeedback": "单件纸证各有分量，可还压不住整条后位链。",
              "answerEvidence": "case-empress-seat-ev-court-note",
              "pursuitUnlockStatementId": "case-empress-seat-pursuit-final",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。庭上追问记录把哭声、名册和诏稿串成一条线：宫人背罪，后位得利，元老被迫闭嘴。"
            },
            {
              "text": "御前书记重新摊开补记：哭声、值夜签和诏稿之间，确实少不了一只传话的手。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-empress-seat-pursuit-final",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-empress-seat-ev-pursuit-note",
              "objection": "异议成立。追击补记：哭声入诏已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "若辩方还不能说清这条线，废后风波就到此封卷。",
              "press": "他把封卷的话先抬出来，可那套“凑巧”的说法还悬着。",
              "wrongEvidenceFeedback": "法官在催结果，可证词真正站不住的地方，还没被这份记录碰到。",
              "answerEvidence": null
            }
          ]
        }
      ]
    },
    {
      "id": "case-crown-shadow",
      "title": "第二案：东宫阴影",
      "chapters": [
        19,
        20,
        21,
        22,
        23
      ],
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
        "tone": "长廊与灯影把储位不安拉成长线。"
      },
      "goal": "查明东宫旧臣为何被推上审判席，找出皇子待遇、高宗病势和储位传闻之间的联系。",
      "menuHook": "旧臣递来的是账册，天亮后却成了罪状。东宫长廊的灯烧了一夜，等着有人把家事写成谋逆。",
      "openingStory": {
        "kicker": "东宫夜审",
        "title": "旧臣袖里的账册，被书记官摊开后变成了储位罪状。",
        "body": "东宫长廊的灯油滴到天亮。被告说自己只是替病榻旁的人送文书，书记官却已经把“储位不稳”四个字写在案头。皇子、问安、旧账、传位记录，全都被摆成一个对旧臣最不利的顺序。",
        "stakes": "人人都说这是皇家家事，可正是这层说法，护住了整理旧账的人，也护住了等着借它定罪的人。"
      },
      "introCards": [
        {
          "title": "账册不是自己走上庭",
          "body": "旧臣只是递账的人，真正可疑的是谁挑中了这些账。"
        },
        {
          "title": "问安被写成试探",
          "body": "一句病榻旁的问候，被批注成储位风向，这中间有人动了笔。"
        },
        {
          "title": "空白日期最吵",
          "body": "记录缺掉的几天，恰好是继承传闻最容易被改写的时候。"
        }
      ],
      "sourceStoryItems": [
        {
          "title": "旧臣递来的账",
          "note": "一份旧账册让东宫旧事重新浮出水面，也让递账的人变成最方便的嫌疑人。"
        },
        {
          "title": "病榻旁的问安",
          "note": "问安笺越整齐，越像有人事后补过。储位之争藏在一句句客气话之间。"
        },
        {
          "title": "皇子名册的空格",
          "note": "名单里不是所有名字都一样重。谁被少写一笔，谁就可能被排到局外。"
        },
        {
          "title": "传位记录被翻出",
          "note": "旧记录本该安静躺在库房里，却在最紧要的时候被人拿出来当刀。"
        },
        {
          "title": "东宫影子压上庭",
          "note": "证人不愿谈继承，只想谈规矩。可规矩被谁拿在手里，才是本案真正的问题。"
        }
      ],
      "openingLines": [
        {
          "speaker": "宫廷书记官",
          "text": "东宫廊下的灯一夜没灭。旧臣说自己只是护送文书，却被指成搅乱储位的人。"
        },
        {
          "speaker": "辩方",
          "text": "太子之争若真只是家事，这些记录就不会改得这样巧。谁改过它们，谁就等着它们替自己说话。"
        },
        {
          "speaker": "邠王守礼",
          "text": "我只见账册被人拿走半日。再回来时，纸还是那几页，意思却像换了一条命。"
        }
      ],
      "verdict": "继承危机不是突然爆发，而是从皇子待遇、储位摇摆和高宗病势中逐步形成。",
      "branch": {
        "revealLabel": "东宫记录的改写人",
        "triggerPress": "只说储位会自然交接，正好遮住了谁整理记录、谁借记录说话。",
        "hiddenText": "东宫风波只是皇子命运起落，书记官没有把小事写成大案。",
        "hiddenPress": "他把自己说成看客，可人物档案明明写着，他一直在挑哪些话能留下。"
      },
      "trap": {
        "evidenceIndex": 0,
        "notice": "东宫旧账反制",
        "risk": "这份旧账只能说明东宫有人害怕，不能单独证明记录被人改写。",
        "feedback": "书记官抓住辩方只谈旧账的漏洞：旧账只能说明东宫不安，不能直接证明有人把不安写成罪名。"
      },
      "index": 2,
      "badEnding": "若无法推翻这组证词，太子处境、皇子命运与高宗末期权力交接会被写成单一罪名。东宫旧臣的沉默将成为定案理由，真正该查的人会躲在案卷后面。",
      "pressureBeats": {
        "danger": {
          "label": "危险",
          "title": "东宫记录锁死",
          "body": "再错一步，东宫旧臣会被定为借储位生乱，皇子们被怎样安排也会被一笔带过。",
          "opponentLine": "书记官把笔停在储位二字上：辩方若不能证明记录被放大，东宫只能自担其罪。"
        },
        "final-warning": {
          "label": "最后警告",
          "title": "储位案最后通牒",
          "body": "法庭已接近维持旧记录。必须把皇子待遇、高宗病势和叙事口径连成一线。",
          "opponentLine": "书记官请法庭封卷：没有更强证据，所谓朝局风险只是东宫旧臣的自辩。"
        }
      },
      "turnaboutBeat": {
        "title": "东宫叙事逆转",
        "body": "正确记录把皇子待遇、高宗病势和书写口径接上，东宫不再只是家庭风波。",
        "opponentLine": "书记官的封卷请求被打断：储位风险已经从旧臣自辩变成朝局证据。",
        "recovery": 1
      },
      "sources": [
        "第十九章 又是一桩疑案",
        "第二十章 帝王之才",
        "第二十一章 皇帝的孩子并非个个有福",
        "第二十二章 还是接班人问题",
        "第二十三章 高宗驾崩"
      ],
      "evidence": [
        {
          "id": "case-crown-shadow-ev-1",
          "name": "东宫旧账册",
          "type": "东宫记录",
          "source": "第19章：第十九章 又是一桩疑案",
          "summary": "东宫旧账册日期被改过，开销和侍从调动挤在同一页。",
          "detail": "它只能说明东宫早已不稳，还不能单独证明谁改写记录。太早拍出来，书记官会顺势反咬。",
          "use": "它先告诉人，东宫的水早就浑了。",
          "counterRisk": "这份旧账只能说明东宫有人害怕，不能单独证明记录被人改写。",
          "counterNotice": "东宫旧账反制"
        },
        {
          "id": "case-crown-shadow-ev-2",
          "name": "太子问安笺",
          "type": "私人书信",
          "source": "第20章：第二十章 帝王之才",
          "summary": "问安笺写得恭顺，旁批却把一句问候改成储位试探。",
          "detail": "同一张纸，家人问病可以变成朝局罪名。真正危险的不是问安，是替问安加注的人。",
          "use": "它最刺眼的不是问安，而是谁把问安写成了罪名。"
        },
        {
          "id": "case-crown-shadow-ev-3",
          "name": "密封的皇子名册",
          "type": "人物名单",
          "source": "第21章：第二十一章 皇帝的孩子并非个个有福",
          "summary": "皇子名册封条重贴，几处待遇差别被圈得很细。",
          "detail": "谁能见驾、谁被调远、谁只能等消息，都在这一页里。所谓家事，已经被整理成可以比较的秩序。",
          "use": "它把所谓家事翻成了一张冷冰冰的待遇表。"
        },
        {
          "id": "case-crown-shadow-ev-4",
          "name": "病榻旁的传位记录",
          "type": "宫廷记录",
          "source": "第22章：第二十二章 还是接班人问题",
          "summary": "病榻传位记录换过纸，前后两页的旧痕对不上。",
          "detail": "病中的一句话最容易被人转述，也最容易被人重写。新纸夹在旧页里，比证人的声音更刺耳。",
          "use": "它说明会说话的不是病人，而是后来换上的那张纸。"
        },
        {
          "id": "case-crown-shadow-ev-5",
          "name": "折角的遗诏副本",
          "type": "诏令副本",
          "source": "第23章：第二十三章 高宗驾崩",
          "summary": "遗诏副本折在旧臣名字那一页，像被反复翻到发软。",
          "detail": "这张副本把病势、储位和旧臣拉到同一处。旧臣不是突然出现在案里，是被人翻出来的。",
          "use": "它让人看见旧臣为何会被翻上案头。"
        },
        {
          "id": "case-crown-shadow-ev-pattern",
          "name": "东宫线索板",
          "type": "推理线索",
          "source": "由本案相关章节归纳",
          "summary": "把皇子待遇、病榻传话和遗诏副本排成一线，能看出东宫旧臣为何被推到风口。",
          "detail": "线板上最醒目的不是旧臣名字，而是几处被挪动过的日期。东宫案像家事，排成顺序后就像一场书写好的罪名。",
          "use": "它把谁挑记录、谁推人上庭的手路排得清清楚楚。"
        },
        {
          "id": "case-crown-shadow-ev-court-note",
          "name": "庭上追问记录",
          "type": "庭审线索",
          "source": "由庭审追问整理",
          "summary": "证人说不清旧臣、问安记录和遗诏副本为什么会同时被翻出。",
          "detail": "书记把这段沉默记了下来。沉默说明东宫案不是旧臣一人能推动的。",
          "use": "它把家事、病势和旧臣定罪串成了同一股力道。",
          "trialOnly": true
        },
        {
          "id": "case-crown-shadow-ev-pursuit-note",
          "name": "追击补记：旧账流向",
          "type": "追击线索",
          "source": "由对照札记追击整理",
          "summary": "守礼追问后松口：旧臣账册不是自己送到庭前的，中途曾被书记官借走。",
          "detail": "补记只多了一句话，却把东宫旧账从私人保管变成了被人挑选过的证物。",
          "use": "它盯住的，是谁先把东宫家事拣成了罪证。",
          "trialOnly": true,
          "pursuitOnly": true
        }
      ],
      "locations": [
        {
          "name": "东宫廊下",
          "description": "东宫廊灯烧到天亮，灯油滴在石阶上。旧臣被押走时，账册还夹在袖里。",
          "sceneVariant": "site",
          "visualNote": "东宫廊影：长廊与灯影把储位不安拉成长线。",
          "evidenceIds": [
            "case-crown-shadow-ev-1",
            "case-crown-shadow-ev-2"
          ],
          "talkTopics": [
            {
              "title": "账册是谁递的",
              "speaker": "邠王守礼",
              "text": "旧臣递账时手在抖。他怕的不是账册本身，是有人等他递出来，再说他借账册议储。"
            },
            {
              "title": "问安为何成罪",
              "speaker": "东宫旧臣",
              "text": "问病是礼，记在旁人笔下就成了试探。若连问安都能定罪，东宫还有谁敢开口？"
            }
          ],
          "examineSpots": [
            {
              "name": "灯油痕",
              "text": "灯油从廊柱一直滴到案前。有人在这里等了一整夜，不像临时听说出了事。"
            },
            {
              "name": "袖口墨痕",
              "text": "墨痕蹭在旧臣袖口内侧，说明账册被匆忙藏过。藏账的人未必有罪，抢账的人更可疑。"
            }
          ]
        },
        {
          "name": "史官案牍房",
          "description": "东宫旧档被摊成两排。一排写皇子待遇，一排写高宗病势，中间偏偏空着几日。",
          "sceneVariant": "archive",
          "visualNote": "案牍房里有旧账、旁注和被重新装订的纸页。",
          "evidenceIds": [
            "case-crown-shadow-ev-3",
            "case-crown-shadow-ev-4"
          ],
          "talkTopics": [
            {
              "title": "空出来的日子",
              "speaker": "史官",
              "text": "最要紧的不是写了什么，是没写什么。那几天没人记问安，后来却突然补出一堆规矩话。"
            },
            {
              "title": "书记官的笔",
              "speaker": "誊录小吏",
              "text": "书记官说自己只是抄。可你看这些批注，谁能见驾、谁不能见驾，都是他先圈出来的。"
            }
          ],
          "examineSpots": [
            {
              "name": "换过纸的病榻记录",
              "text": "纸色比前后两页新，折痕却故意压旧。有人不想让这段记录看起来像后来补的。"
            },
            {
              "name": "皇子名册空格",
              "text": "几个名字后面留着空格，像等人补上命运。东宫案的刀不在字上，在空出来的位置上。"
            }
          ]
        },
        {
          "name": "辩护席",
          "description": "辩护席只剩一盏小灯。东宫案不能靠喊冤赢，必须让法庭看见谁把家事写成罪名。",
          "sceneVariant": "defense",
          "visualNote": "辩护席上铺着证物、人物名牌和一张等待补完的线索板。",
          "evidenceIds": [
            "case-crown-shadow-ev-5",
            "case-crown-shadow-ev-pattern"
          ],
          "talkTopics": [
            {
              "title": "家事底下那只手",
              "speaker": "辩方",
              "text": "对手爱把东宫案说成家事。可家事不会自己排成那个顺序，更不会只把旧臣一个人推到风口上。"
            },
            {
              "title": "人物档案的用法",
              "speaker": "书记助手",
              "text": "书记官若说自己旁观，就打开人物档案。旁观的人不会提前圈好哪些记录该留下。"
            }
          ],
          "examineSpots": [
            {
              "name": "分开的两摞纸",
              "text": "一摞是待遇，一摞是病势。单看都像宫务，合在一起才像有人在替储位铺路。"
            },
            {
              "name": "旧臣的名牌",
              "text": "名牌边角被攥裂。一个传递文书的人，为什么会被摆到整场继承争议的最前面？"
            }
          ]
        }
      ],
      "timeline": [
        {
          "label": "卷宗19",
          "title": "第十九章 又是一桩疑案",
          "note": "与“太子处境、皇子命运与高宗末期权力交接”相关的阶段性线索。"
        },
        {
          "label": "卷宗20",
          "title": "第二十章 帝王之才",
          "note": "与“太子处境、皇子命运与高宗末期权力交接”相关的阶段性线索。"
        },
        {
          "label": "卷宗21",
          "title": "第二十一章 皇帝的孩子并非个个有福",
          "note": "与“太子处境、皇子命运与高宗末期权力交接”相关的阶段性线索。"
        },
        {
          "label": "卷宗22",
          "title": "第二十二章 还是接班人问题",
          "note": "与“太子处境、皇子命运与高宗末期权力交接”相关的阶段性线索。"
        },
        {
          "label": "卷宗23",
          "title": "第二十三章 高宗驾崩",
          "note": "与“太子处境、皇子命运与高宗末期权力交接”相关的阶段性线索。"
        }
      ],
      "testimony": [
        {
          "speaker": "邠王守礼",
          "title": "证词一：表面原因",
          "mood": "cautious",
          "statements": [
            {
              "text": "东宫旧臣递账那晚，廊灯一直亮着。可我只看见他抱着账册，没看见有人逼他来。",
              "press": "邠王守礼把自己摘得很干净，可那本账册偏偏挑在那一夜上桌，不会只是巧合。",
              "wrongEvidenceFeedback": "眼下还只是风声。案上的纸还没碰到真正伤人的地方。",
              "answerEvidence": null
            },
            {
              "text": "旧臣借账册议论储位，本就是他自己惹出的祸，和皇子待遇、病榻传话没什么关系。",
              "press": "他急着把账册说成旧臣一个人的祸，倒把东宫改过的旧记录晾了出来。",
              "wrongEvidenceFeedback": "这份记录还碰不到“病榻传话无关”那层说法。后手还藏在账册后面。",
              "answerEvidence": "case-crown-shadow-ev-2",
              "pursuitUnlockStatementId": "case-crown-shadow-pursuit-surface",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。太子问安笺显示东宫记录前后不一致，旧臣不是凭空把储位卷进来的。"
            },
            {
              "text": "邠王守礼承认，旧账册在入庭前曾被书记官借走半日。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-crown-shadow-pursuit-surface",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-crown-shadow-ev-pursuit-note",
              "objection": "异议成立。追击补记：旧账流向已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "我只知道最后旧臣被押走。至于谁先挑出这些记录，我不便多说。",
              "press": "他不是不知道，是不敢把谁先挑出记录这件事说穿。",
              "wrongEvidenceFeedback": "这里只露了一道缝，还没碰到案子最硬的骨头。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "宫廷书记官",
          "title": "证词二：合法性",
          "mood": "aggressive",
          "statements": [
            {
              "text": "东宫记录一向按规矩誊录，辩方不必再问谁挑字、谁留白。",
              "press": "只说储位会自然交接，正好遮住了谁整理记录、谁借记录说话。",
              "unlockStatementId": "case-crown-shadow-legality-branch",
              "wrongEvidenceFeedback": "书记官正在把挑选记录说成规矩。先追问，逼出隐藏证词。",
              "answerEvidence": null
            },
            {
              "text": "东宫风波只是皇子命运起落，书记官没有把小事写成大案。",
              "press": "他把自己说成看客，可人物档案明明写着，他一直在挑哪些话能留下。",
              "hiddenUntilPressed": "case-crown-shadow-legality-branch",
              "revealLabel": "东宫记录的改写人",
              "wrongEvidenceFeedback": "藏起来的是书记官本人。翻人物档案，比绕着证物兜圈子更准。",
              "answerProfile": "宫廷书记官",
              "answerEvidence": null,
              "objection": "异议成立。宫廷书记官一直在决定哪些话留下，不能把自己说成只会誊录的笔。"
            },
            {
              "text": "问安笺、名册、遗诏副本都只是宫中旧档，没有人把小事写成大案。",
              "press": "他把三份记录拆开解释。要反击，就指出它们被同一套手法排过顺序。",
              "wrongEvidenceFeedback": "要打“没有人写成大案”，需要能显示记录被整理和加压的证物。",
              "counterEvidence": "case-crown-shadow-ev-1",
              "counterRecoveryId": "case-crown-shadow-counter-recovery",
              "counterNotice": "东宫旧账反制",
              "counterFeedback": "书记官抓住辩方只谈旧账的漏洞：旧账只能说明东宫不安，不能直接证明有人把不安写成罪名。",
              "counterPenalty": 2,
              "answerEvidence": "case-crown-shadow-ev-4",
              "pursuitUnlockStatementId": "case-crown-shadow-pursuit-legality",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。病榻旁的传位记录显示病榻传话被换过纸，所谓旧档已经被人重新安排过。"
            },
            {
              "text": "书记官改口说，那些空白日期不是漏写，而是等人决定该留下哪种说法。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-crown-shadow-pursuit-legality",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-crown-shadow-ev-pursuit-note",
              "objection": "异议成立。追击补记：旧账流向已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "宫廷书记官反制后留下了一个缺口：他只证明刚才那件证物不够，却没有解释后续动作是谁做的。",
              "press": "他刚躲过去的，不是结尾，是后手。那块空白还晾在案上。",
              "hiddenUntilPressed": "case-crown-shadow-counter-recovery",
              "revealLabel": "反制后的补救破绽",
              "optionalRecovery": true,
              "recoveryCredibility": 1,
              "wrongEvidenceFeedback": "刚才那道空白还挂在后面，没必要再回去碰已经塌掉的那页。",
              "answerEvidence": "case-crown-shadow-ev-4",
              "objection": "补救成立。病榻旁的传位记录避开刚才的漏洞，直接说明公开说法背后还有人动手整理。"
            },
            {
              "text": "既然最后旧臣承担了罪名，东宫这场风波就该按旧记录结案。",
              "press": "旧记录也可能是胜者留下的记录。胜负不能自动证明记录可靠。",
              "wrongEvidenceFeedback": "这番话滑得很，可真正伤人的地方还不在这里。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "御前书记",
          "title": "证词三：最终推理",
          "mood": "decisive",
          "statements": [
            {
              "text": "辩方拿出许多旧纸，却还没说明旧臣为什么会突然站到风口上。",
              "press": "他说旧臣忽然站到风口上，可那阵风分明是有人一页页扇起来的。",
              "pressUnlockEvidence": "case-crown-shadow-ev-court-note",
              "wrongEvidenceFeedback": "案上的线还没拢成一处，这份记录压不住整场风波。",
              "answerEvidence": null
            },
            {
              "text": "皇子待遇、病榻传话和旧臣被押，只是同一时期的三件事，没有同一只手。",
              "press": "待遇、传话、被押这三件事一并排开，谁把家事写成罪名就躲不掉了。",
              "wrongEvidenceFeedback": "单件旧纸各说各话，还压不住这条东宫线。",
              "answerEvidence": "case-crown-shadow-ev-court-note",
              "pursuitUnlockStatementId": "case-crown-shadow-pursuit-final",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。庭上追问记录说明三件事不是同时发生而已，而是有人挑出记录，把旧臣推到前面。"
            },
            {
              "text": "御前书记沉声补道：旧臣不是自己走到风口，是账册先被人递到了那里。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-crown-shadow-pursuit-final",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-crown-shadow-ev-pursuit-note",
              "objection": "异议成立。追击补记：旧账流向已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "若这条线连不起来，东宫案就只能维持旧臣有罪。",
              "press": "他把“没有同一只手”挂在嘴边，可那只手的影子已经落在纸上了。",
              "wrongEvidenceFeedback": "法官在催结果，可证词真正站不住的地方，还没被这份记录碰到。",
              "answerEvidence": null
            }
          ]
        }
      ]
    },
    {
      "id": "case-rebellion-box",
      "title": "第三案：告密铜匦",
      "chapters": [
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31
      ],
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
        "tone": "铜匦、告密札与洛阳广场的回声交织成压力。"
      },
      "goal": "查清告密铜匦里的投书如何从一张纸变成一场大案，救下被告发的李唐旧臣。",
      "menuHook": "铜匦吐出一封投书，半日后满城已经替旧臣定罪。纸每转一手，罪名就跟着重一层。",
      "openingStory": {
        "kicker": "铜匦开封",
        "title": "一封投书从匣中取出时，还没有重到能压死人。",
        "body": "明堂前的人群挤到榜文下面，谁都说自己只是听见了官府消息。投书还没让被告看一眼，街口已经喊完了谋反。真正让案子重起来的，不是第一声告发，而是纸离开铜匦后经过的那些手。",
        "stakes": "只看告密原札，酷吏就还能装成传话的人；转手路线一摊开，加罪的人就得站到灯下。"
      },
      "introCards": [
        {
          "title": "投书只是开头",
          "body": "原札能证明有人告发，却不能证明谋反已经成立。"
        },
        {
          "title": "榜文跑在审问前",
          "body": "百姓先听见结论，被告再也难以解释过程。"
        },
        {
          "title": "每转一手，罪重一层",
          "body": "残檄、名册、缉捕令像接力一样把恐惧越传越远。"
        }
      ],
      "sourceStoryItems": [
        {
          "title": "铜匦里的投书",
          "note": "纸还没展开，罪名已经在旁人嘴里成形。告密和事实之间，隔着一条很长的路。"
        },
        {
          "title": "街上的榜文",
          "note": "榜文比审问先到百姓眼前，像有人急着让所有人相信被告已经有罪。"
        },
        {
          "title": "残檄的缺口",
          "note": "檄文被撕开后，剩下的字刚好足够吓人，也刚好不够完整。"
        },
        {
          "title": "酷吏的名单",
          "note": "审讯名单写得太满，像不是为了查清谁说谎，而是为了让每个人都害怕开口。"
        },
        {
          "title": "缉捕令的墨迹",
          "note": "墨还没干，抓人的命令已经发出。有人把审理变成了追捕。"
        },
        {
          "title": "兵败后的空白",
          "note": "兵败之后，最先消失的不是人，而是能替人说清楚前因后果的记录。"
        },
        {
          "title": "疾风里的证人",
          "note": "越是人人自保的时候，敢留下只字片语的人越少。那些小字，也许比高声控诉更可靠。"
        },
        {
          "title": "舆论先判了案",
          "note": "百姓听到的是结论，不是过程。法庭若也只听结论，真正加罪的人就永远不用上庭。"
        }
      ],
      "openingLines": [
        {
          "speaker": "告密人",
          "text": "明堂前的铜匦刚被打开，一张投书就被当成铁证。被告旧臣连看一眼纸条的机会都没有。"
        },
        {
          "speaker": "辩方",
          "text": "投书只是个开头。它离开铜匦以后，才一步步长成能压死人的罪名。"
        },
        {
          "speaker": "来俊臣",
          "text": "铜匦收的是民声。辩方若怀疑民声，最好先想清楚自己站在谁的对面。"
        }
      ],
      "verdict": "告密制度把疑惧变成案件原料，酷吏再把案件加工成威慑。",
      "branch": {
        "revealLabel": "铜匦告密后的加工者",
        "triggerPress": "告密札只是入口，真正该问的是谁把一张纸变成一场大案。",
        "hiddenText": "铜匦收来的告密天然可信，来俊臣只是照章转呈，没有添油加醋。",
        "hiddenPress": "他装得像个传话的，可人物档案能看出，正是他把人心里的怕劲做成了案子。"
      },
      "trap": {
        "evidenceIndex": 0,
        "notice": "告密原札反制",
        "risk": "这份原札只能证明有人投书，不能直接证明来俊臣后来做了什么。",
        "feedback": "来俊臣顺势把焦点推回告密原札：只证明有人投书，反而让酷吏加工案件的关键责任暂时脱身。"
      },
      "index": 3,
      "badEnding": "若无法推翻这组证词，女皇登基、徐敬业起兵、告密制度与酷吏政治会被写成单一罪名。被告发的李唐旧臣的沉默将成为定案理由，真正该查的人会躲在案卷后面。",
      "pressureBeats": {
        "danger": {
          "label": "危险",
          "title": "铜匦回声压庭",
          "body": "再失误，告密原札会被直接当成罪证，酷吏加工案件的环节将脱离审判。",
          "opponentLine": "来俊臣顺势追问：辩方若只否认告密，法庭就只能相信铜匦已经说完真相。"
        },
        "final-warning": {
          "label": "最后警告",
          "title": "酷吏定案在即",
          "body": "法庭只剩最后耐心。必须指出告密如何被酷吏加工成威慑机器。",
          "opponentLine": "来俊臣要求立刻定案：再拿不出加工链条，旧臣之罪就由铜匦原札坐实。"
        }
      },
      "turnaboutBeat": {
        "title": "告密机器逆转",
        "body": "证物把投书入口和酷吏加工分开，铜匦不再能独自替案件定罪。",
        "opponentLine": "来俊臣的定案请求被压回原点：告密原札只是材料，真正的威慑来自加工链条。",
        "recovery": 1
      },
      "sources": [
        "第二十四章 中国的第一个女皇帝就这样登基",
        "第二十五章 男妃冯小宝",
        "第二十六章 徐敬业起兵与《讨武曌檄》",
        "第二十七章 讨武兵败",
        "第二十八章 检举箱的发明",
        "第二十九章 冤案少不了酷吏和酷刑",
        "第三十章 也有疾风劲草",
        "第三十一章 公众舆论"
      ],
      "evidence": [
        {
          "id": "case-rebellion-box-ev-1",
          "name": "铜匦里的告密原札",
          "type": "告密投书",
          "source": "第24章：第二十四章 中国的第一个女皇帝就这样登基",
          "summary": "铜匦原札只有几行，没有亲眼所见，只有一个很重的怀疑。",
          "detail": "它是案子的入口，不是案子的答案。纸刚离开铜匦时，还没有重到能压成谋反。",
          "use": "它只够说明怀疑从这里起身，还不够说明谋反已经落定。",
          "counterRisk": "这份原札只能证明有人投书，不能直接证明来俊臣后来做了什么。",
          "counterNotice": "告密原札反制"
        },
        {
          "id": "case-rebellion-box-ev-2",
          "name": "讨武檄文残页",
          "type": "公开文告",
          "source": "第25章：第二十五章 男妃冯小宝",
          "summary": "檄文残页被撕得只剩狠话，边上又补了官府罪名。",
          "detail": "缺掉的前后文无人再问，留下来的字正好足够吓人。有人把残页当成了完整事实。",
          "use": "它逼人去看那张残页缺掉的半截。"
        },
        {
          "id": "case-rebellion-box-ev-3",
          "name": "洛阳街口榜文",
          "type": "告示",
          "source": "第26章：第二十六章 徐敬业起兵与《讨武曌檄》",
          "summary": "街口榜文还带着浆糊味，路人的批注已经替法庭判完了。",
          "detail": "它不是安民告示，更像把传闻先钉到墙上。等所有人都信了，被告就很难再开口。",
          "use": "它说明街口的恐惧是被人贴出来的。"
        },
        {
          "id": "case-rebellion-box-ev-4",
          "name": "酷吏审讯名册",
          "type": "审讯记录",
          "source": "第27章：第二十七章 讨武兵败",
          "summary": "审讯名册里几份口供笔迹相近，像同一只手扶着不同人写话。",
          "detail": "告密人投的是纸，审讯者改的是人。口供越整齐，越不像众人各自说出的真相。",
          "use": "它把矛头从投书人身上转回了办案的人。"
        },
        {
          "id": "case-rebellion-box-ev-5",
          "name": "夜半加印的缉捕令",
          "type": "官府命令",
          "source": "第28章：第二十八章 检举箱的发明",
          "summary": "缉捕令夜里加印，从一个名字滚成一串旧臣。",
          "detail": "第一行还像追查，末尾已经像清算。命令扩得太快，快到像有人早准备好名单。",
          "use": "它让人看见罪名是在转手途中越滚越重的。"
        },
        {
          "id": "case-rebellion-box-ev-pattern",
          "name": "告密流向图",
          "type": "推理线索",
          "source": "由本案相关章节归纳",
          "summary": "从铜匦原札到榜文、审讯名册和缉捕令，能看出一张投书怎样变成大案。",
          "detail": "图上每一道箭头都比上一道更重：投书只是入口，榜文和名册才把人拖进谋反。",
          "use": "它把那只一路替罪名加码的手画了出来。"
        },
        {
          "id": "case-rebellion-box-ev-court-note",
          "name": "庭上追问记录",
          "type": "庭审线索",
          "source": "由庭审追问整理",
          "summary": "追问后留下的记录显示：投书离开铜匦后，罪名每转一手就更重。",
          "detail": "证人不愿说哪只手加了罪，只留下这段答不上来的停顿。停顿本身就是线索。",
          "use": "它让人看见一封投书是怎样被养成大案的。",
          "trialOnly": true
        },
        {
          "id": "case-rebellion-box-ev-pursuit-note",
          "name": "追击补记：投书转手",
          "type": "追击线索",
          "source": "由对照札记追击整理",
          "summary": "告密人承认投书离开铜匦后，他再见到它时，纸边已经多了官府标注。",
          "detail": "补记证明加罪发生在转手途中。投书人没有写出的字，后来被别人补了上去。",
          "use": "它盯住的，是哪只手把告密添成了谋反。",
          "trialOnly": true,
          "pursuitOnly": true
        }
      ],
      "locations": [
        {
          "name": "洛阳明堂前",
          "description": "洛阳明堂前，铜匦旁还挤着看榜的人。投书口安静，街口却已经替法庭喊完了判词。",
          "sceneVariant": "site",
          "visualNote": "明堂铜匦：铜匦、告密札与洛阳广场的回声交织成压力。",
          "evidenceIds": [
            "case-rebellion-box-ev-1",
            "case-rebellion-box-ev-2"
          ],
          "talkTopics": [
            {
              "title": "投书人看见什么",
              "speaker": "告密人",
              "text": "我只投了一张纸。纸离开铜匦之后，怎么变成满城都知道的谋反，我不敢问，也没人让我问。"
            },
            {
              "title": "榜文为何这么快",
              "speaker": "洛阳小吏",
              "text": "榜文贴得比传唤还快。来俊臣的人说先稳住人心，可街上人心一稳，被告就没法说话了。"
            }
          ],
          "examineSpots": [
            {
              "name": "铜匦投入口",
              "text": "入口边缘磨得发亮，说明来投书的人不少。告密制度像一张嘴，吞进去的是纸，吐出来的是罪名。"
            },
            {
              "name": "半干的榜文",
              "text": "浆糊还黏手，围观者的批注已经写满边角。舆论比审问先跑到街上。"
            }
          ]
        },
        {
          "name": "史官案牍房",
          "description": "审讯名册、残檄和缉捕令被摊在同一张桌上。每多一张纸，罪名就长出一层硬壳。",
          "sceneVariant": "archive",
          "visualNote": "案牍房里有旧账、旁注和被重新装订的纸页。",
          "evidenceIds": [
            "case-rebellion-box-ev-3",
            "case-rebellion-box-ev-4"
          ],
          "talkTopics": [
            {
              "title": "檄文残页",
              "speaker": "誊录小吏",
              "text": "残页只剩最狠的几句，温和的前后文全没了。若有人只拿残页说话，谁都能被拖成同党。"
            },
            {
              "title": "名册里的同笔迹",
              "speaker": "史官",
              "text": "几个人的口供像同一只手扶着写出来的。人会怕得相似，字却不该相似到这个地步。"
            }
          ],
          "examineSpots": [
            {
              "name": "连夜加印的缉捕令",
              "text": "第一行抓一人，末尾已经变成一串旧臣。名单不是查出来的，是一路滚大的。"
            },
            {
              "name": "压在檄文上的官印",
              "text": "官印把残页压得很平，像不许任何人再把缺掉的部分找回来。"
            }
          ]
        },
        {
          "name": "辩护席",
          "description": "辩护席上，铜匦原札放在最左，缉捕令放在最右。中间每隔一寸，都是来俊臣能动手的地方。",
          "sceneVariant": "defense",
          "visualNote": "辩护席上铺着证物、人物名牌和一张等待补完的线索板。",
          "evidenceIds": [
            "case-rebellion-box-ev-5",
            "case-rebellion-box-ev-pattern"
          ],
          "talkTopics": [
            {
              "title": "别替投书定案",
              "speaker": "辩方",
              "text": "原札只能证明有人告发，不能证明谋反成立。若你拿它硬打，来俊臣会说我们也承认告发可信。"
            },
            {
              "title": "真正要追的手",
              "speaker": "书记助手",
              "text": "盯住纸从铜匦到榜文的路。每一次转手，都可能有人往罪名里加一把火。"
            }
          ],
          "examineSpots": [
            {
              "name": "红线流向图",
              "text": "红线从投入口绕到街口，再绕进审讯房。线越长，投书人越不像唯一能决定案情的人。"
            },
            {
              "name": "被圈出的来俊臣",
              "text": "他的名字被圈了三次。不是因为他出现得早，而是因为每次罪名变重，他都在场。"
            }
          ]
        }
      ],
      "timeline": [
        {
          "label": "卷宗24",
          "title": "第二十四章 中国的第一个女皇帝就这样登基",
          "note": "与“女皇登基、徐敬业起兵、告密制度与酷吏政治”相关的阶段性线索。"
        },
        {
          "label": "卷宗25",
          "title": "第二十五章 男妃冯小宝",
          "note": "与“女皇登基、徐敬业起兵、告密制度与酷吏政治”相关的阶段性线索。"
        },
        {
          "label": "卷宗26",
          "title": "第二十六章 徐敬业起兵与《讨武曌檄》",
          "note": "与“女皇登基、徐敬业起兵、告密制度与酷吏政治”相关的阶段性线索。"
        },
        {
          "label": "卷宗27",
          "title": "第二十七章 讨武兵败",
          "note": "与“女皇登基、徐敬业起兵、告密制度与酷吏政治”相关的阶段性线索。"
        },
        {
          "label": "卷宗28",
          "title": "第二十八章 检举箱的发明",
          "note": "与“女皇登基、徐敬业起兵、告密制度与酷吏政治”相关的阶段性线索。"
        },
        {
          "label": "卷宗29",
          "title": "第二十九章 冤案少不了酷吏和酷刑",
          "note": "与“女皇登基、徐敬业起兵、告密制度与酷吏政治”相关的阶段性线索。"
        },
        {
          "label": "卷宗30",
          "title": "第三十章 也有疾风劲草",
          "note": "与“女皇登基、徐敬业起兵、告密制度与酷吏政治”相关的阶段性线索。"
        },
        {
          "label": "卷宗31",
          "title": "第三十一章 公众舆论",
          "note": "与“女皇登基、徐敬业起兵、告密制度与酷吏政治”相关的阶段性线索。"
        }
      ],
      "testimony": [
        {
          "speaker": "告密人",
          "title": "证词一：表面原因",
          "mood": "cautious",
          "statements": [
            {
              "text": "我只把纸投进铜匦。后来街上怎么喊、官府怎么抓，我一个告密人管不了。",
              "press": "告密人只肯认自己投过书，却不肯认那张纸后来经过了谁的手。",
              "wrongEvidenceFeedback": "眼下还只是风声。案上的纸还没碰到真正伤人的地方。",
              "answerEvidence": null
            },
            {
              "text": "被告本来就心虚，投书只是把旧臣谋反揭出来，和谁扩大案情没有关系。",
              "press": "他把投书说成完整真相，倒把后面添上的罪名一起带了出来。",
              "wrongEvidenceFeedback": "这份记录还只碰到投书的入口，后面那层加罪的手还没被扯出来。",
              "answerEvidence": "case-rebellion-box-ev-2",
              "pursuitUnlockStatementId": "case-rebellion-box-pursuit-surface",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。讨武檄文残页显示告发内容后来被重新标注罪名，投书不是一开始就等于谋反。"
            },
            {
              "text": "告密人终于承认，他再见原札时，纸边已经多了官府标注。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-rebellion-box-pursuit-surface",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-rebellion-box-ev-pursuit-note",
              "objection": "异议成立。追击补记：投书转手已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "我只记得榜文贴得很快。快不快，那是官府的事，不是我的事。",
              "press": "他嘴上把榜文的事往外推，可“太快”两个字已经露了底。",
              "wrongEvidenceFeedback": "这里只露了一道缝，还没碰到案子最硬的骨头。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "来俊臣",
          "title": "证词二：合法性",
          "mood": "aggressive",
          "statements": [
            {
              "text": "告密入匦以后就是官府记录，辩方再问谁转手，是在替乱臣找路。",
              "press": "告密札只是入口，真正该问的是谁把一张纸变成一场大案。",
              "unlockStatementId": "case-rebellion-box-legality-branch",
              "wrongEvidenceFeedback": "来俊臣把转手那段路压得很死。真正露风的地方，还藏在他没肯明说的那半截里。",
              "answerEvidence": null
            },
            {
              "text": "铜匦收来的告密天然可信，来俊臣只是照章转呈，没有添油加醋。",
              "press": "他装得像个传话的，可人物档案能看出，正是他把人心里的怕劲做成了案子。",
              "hiddenUntilPressed": "case-rebellion-box-legality-branch",
              "revealLabel": "铜匦告密后的加工者",
              "wrongEvidenceFeedback": "这里要揪出来的是来俊臣本人。人物档案比旁的证物更能撕掉他的看客样。",
              "answerProfile": "来俊臣",
              "answerEvidence": null,
              "objection": "异议成立。来俊臣不是接到案子才出现，他一直在把告发改造成大案。"
            },
            {
              "text": "街上的榜文和审讯名册只是照原札办理，没有人借它们逼证人改口。",
              "press": "他把扩散和审讯都说成照办。要反击，就指出名册里同一只手的痕迹。",
              "wrongEvidenceFeedback": "需要能显示审讯和扩散被人加工的证物。",
              "counterEvidence": "case-rebellion-box-ev-1",
              "counterRecoveryId": "case-rebellion-box-counter-recovery",
              "counterNotice": "告密原札反制",
              "counterFeedback": "来俊臣顺势把焦点推回告密原札：只证明有人投书，反而让酷吏加工案件的关键责任暂时脱身。",
              "counterPenalty": 2,
              "answerEvidence": "case-rebellion-box-ev-4",
              "pursuitUnlockStatementId": "case-rebellion-box-pursuit-legality",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。酷吏审讯名册里的口供被同一笔迹补过，案情不是照原札自然长大。"
            },
            {
              "text": "来俊臣避开了转手路线，只说标注是办案常例，却不说是谁先添的字。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-rebellion-box-pursuit-legality",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-rebellion-box-ev-pursuit-note",
              "objection": "异议成立。追击补记：投书转手已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "来俊臣反制后留下了一个缺口：他只证明刚才那件证物不够，却没有解释后续动作是谁做的。",
              "press": "他刚躲过去的，不是结尾，是后手。那块空白还晾在案上。",
              "hiddenUntilPressed": "case-rebellion-box-counter-recovery",
              "revealLabel": "反制后的补救破绽",
              "optionalRecovery": true,
              "recoveryCredibility": 1,
              "wrongEvidenceFeedback": "刚才那道空白还挂在后面，没必要再回去碰已经塌掉的那页。",
              "answerEvidence": "case-rebellion-box-ev-4",
              "objection": "补救成立。酷吏审讯名册避开刚才的漏洞，直接说明公开说法背后还有人动手整理。"
            },
            {
              "text": "既然最后抓到了许多人，就说明原先那封投书没有错。",
              "press": "抓得多不能证明原札准，只可能说明网撒得大。别被结果带走。",
              "wrongEvidenceFeedback": "这番话滑得很，可真正伤人的地方还不在这里。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "御前书记",
          "title": "证词三：最终推理",
          "mood": "decisive",
          "statements": [
            {
              "text": "辩方说了铜匦、榜文、名册，却还没说清一张纸怎么变成一张网。",
              "press": "他说不清一张纸怎么变成一张网，可那张网的结已经一处处露出来了。",
              "pressUnlockEvidence": "case-rebellion-box-ev-court-note",
              "wrongEvidenceFeedback": "案上的线还没拢成一处，这份记录压不住整场风波。",
              "answerEvidence": null
            },
            {
              "text": "投书、榜文、缉捕令只是案情自然推进，没有同一个人借机加罪。",
              "press": "投书、榜文、缉捕令一旦按转手顺序排开，谁在一路加罪就藏不住了。",
              "wrongEvidenceFeedback": "单件纸证能咬住一步，咬不住整条加罪的路。",
              "answerEvidence": "case-rebellion-box-ev-court-note",
              "pursuitUnlockStatementId": "case-rebellion-box-pursuit-final",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。庭上追问记录显示这不是自然推进，而是投书每转一次手，罪名就被加重一次。"
            },
            {
              "text": "御前书记写下补记：投书每转一次手，罪名就比原来重一层。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-rebellion-box-pursuit-final",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-rebellion-box-ev-pursuit-note",
              "objection": "异议成立。追击补记：投书转手已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "若辩方无法说明这条路，告密案就按谋反定案。",
              "press": "他把“自然推进”挂在嘴边，可这条路分明有人一段段铺过。",
              "wrongEvidenceFeedback": "法官在催结果，可证词真正站不住的地方，还没被这份记录碰到。",
              "answerEvidence": null
            }
          ]
        }
      ]
    },
    {
      "id": "case-urn",
      "title": "第四案：请君入瓮",
      "chapters": [
        36,
        37,
        38,
        39,
        40,
        41
      ],
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
        "tone": "审讯室、刑具阴影与反噬逻辑都摆在同一张案上。"
      },
      "goal": "查明狄仁杰供词为何前后不合，证明御史台的审讯手段正在反咬办案者自己。",
      "menuHook": "御史台供状干净得刺眼，暗室里的空瓮却还没凉。供词若真是自愿写下，瓮口就不会还冒着灰味。",
      "openingStory": {
        "kicker": "暗室余温",
        "title": "供状太整齐，反而像刚从刑具旁擦干净。",
        "body": "周兴把狄仁杰的签押拍到案上，声音比证词还重。供状写得端正，副本抄得一致，审讯手册折在该折的一页。只有墙边那口空瓮还留着灰味，像在等人承认：这不是认罪，是一套流程。",
        "stakes": "只看供状，赢的就是酷吏；瓮、笔迹和手册一摆出来，自愿二字自己会裂开。"
      },
      "introCards": [
        {
          "title": "供状干净得不自然",
          "body": "真正害怕的人会停笔、会改字，不会像照着答案写完。"
        },
        {
          "title": "空瓮离案桌太近",
          "body": "刑具若只是摆设，就不会正好停在签押前的位置。"
        },
        {
          "title": "手册折在逼供页",
          "body": "这不是一次失控，而是办案者反复练熟的办法。"
        }
      ],
      "sourceStoryItems": [
        {
          "title": "空瓮留在暗室",
          "note": "刑具没有说话，却比供状诚实。它告诉你：有人曾在这里等一个人崩溃。"
        },
        {
          "title": "供状上的笔锋",
          "note": "笔画一顺到底，像写字的人没有停顿，也没有犹豫。真正的供词不该这样干净。"
        },
        {
          "title": "副本里一模一样的话",
          "note": "几份供状像互相照抄，错也错在同一处。恐惧会重复，伪造也会。"
        },
        {
          "title": "审讯手册的折角",
          "note": "手册折在逼供那一页，说明这不是一场偶然失控，而是一套被反复使用的方法。"
        },
        {
          "title": "救援纸条迟到了",
          "note": "有人想把狄仁杰救出来，却来得太晚。迟到的纸条也许正能证明供词来得太快。"
        },
        {
          "title": "用贤也会招祸",
          "note": "有才能的人未必安全。有人怕他活着，供状就更像替别人写好的自白。"
        }
      ],
      "openingLines": [
        {
          "speaker": "周兴",
          "text": "御史台暗室里摆着一口空瓮。周兴说供词已经签下，狄仁杰再辩也无用。"
        },
        {
          "speaker": "辩方",
          "text": "这份供词整齐得过了头，像照着什么写出来的。瓮、手册和笔迹一旦摆到案上，谁也别想再把它说成自愿。"
        },
        {
          "speaker": "魏元忠",
          "text": "我听见瓮被拖过地面。那声音不在供状上，却比供状更难忘。"
        }
      ],
      "verdict": "真正被审判的是酷吏政治：它能制造恐惧，却无法长期制造合法性。",
      "branch": {
        "revealLabel": "瓮中审讯的设计者",
        "triggerPress": "审讯越说得像普通问案，越要追问是谁设计了那口瓮。",
        "hiddenText": "御史台只是按旧例问案，周兴没有把逼供术当成办案诀窍。",
        "hiddenPress": "他把逼供说成旧例，可人物档案一翻，就知道这套法子是谁琢磨出来的。"
      },
      "trap": {
        "evidenceIndex": 2,
        "notice": "酷吏话术反制",
        "risk": "这份供词只能指出一处破绽，不能直接证明逼供办法已经害到办案者自己。",
        "feedback": "周兴老想把人拽回单份供词的真假上。可只盯着那张纸，瓮、手册和逼供的顺序就都要被他撇开了。"
      },
      "index": 4,
      "badEnding": "若无法推翻这组证词，酷吏反噬、狄仁杰与魏元忠、继承争议会被写成单一罪名。狄仁杰的沉默将成为定案理由，真正该查的人会躲在案卷后面。",
      "pressureBeats": {
        "danger": {
          "label": "危险",
          "title": "瓮中反噬临界",
          "body": "再错一步，逼供术会被包装成正常问案，狄仁杰的翻案入口将被关闭。",
          "opponentLine": "周兴把供词推回案上：辩方若证明不了制度反噬，御史台流程仍可压过一切。"
        },
        "final-warning": {
          "label": "最后警告",
          "title": "御史台最后警告",
          "body": "法庭准备接受酷吏流程。必须用证物证明逼供技术已经吞噬自己的合法性。",
          "opponentLine": "周兴请法庭维持供词：再无反噬证据，狄仁杰只能留在瓮中。"
        }
      },
      "turnaboutBeat": {
        "title": "瓮口反开",
        "body": "证物证明逼供术已经吞噬自己的程序，酷吏流程反而成为翻案入口。",
        "opponentLine": "周兴的供词压制被反噬：御史台流程越完整，越证明酷吏政治正在失控。",
        "recovery": 1
      },
      "sources": [
        "第三十六章 请君入瓮种种",
        "第三十七章 狄仁杰与魏元忠",
        "第三十八章 仍然是接班人的麻烦",
        "第三十九章 无可奈何的情人",
        "第四十章 万人空巷的判决",
        "第四十一章 用贤之患"
      ],
      "evidence": [
        {
          "id": "case-urn-ev-1",
          "name": "瓮口烙痕",
          "type": "审讯物证",
          "source": "第36章：第三十六章 请君入瓮种种",
          "summary": "空瓮边缘有新烙痕，焦黑处还没完全冷透。",
          "detail": "它不是传说里的吓人故事，而是暗室里留下的威胁。看见它，就知道供状不是从纸上长出来的。",
          "use": "它把空瓮和供案之间那点距离钉死了。"
        },
        {
          "id": "case-urn-ev-2",
          "name": "狄仁杰亲笔供状",
          "type": "供词",
          "source": "第37章：第三十七章 狄仁杰与魏元忠",
          "summary": "狄仁杰供状前半稳，后半乱，最后的签押像被逼着赶完。",
          "detail": "纸面看似完整，笔迹却在关键处发抖。自愿认罪的人，不该把恐惧写进收笔里。",
          "use": "它让那枚签押再也不像自愿落下的。"
        },
        {
          "id": "case-urn-ev-3",
          "name": "御史台口供副本",
          "type": "供词副本",
          "source": "第38章：第三十八章 仍然是接班人的麻烦",
          "summary": "御史台副本能看出供词破绽，但单独使用很容易被周兴带偏。",
          "detail": "它说明供状有问题，却还没说明问题从哪里来。若只盯副本，对手会把它说成抄录误差。",
          "use": "它先露出供词的破口，却还没把整套办法全掀开。",
          "counterRisk": "这份供词只能指出一处破绽，不能直接证明逼供办法已经害到办案者自己。",
          "counterNotice": "酷吏话术反制"
        },
        {
          "id": "case-urn-ev-4",
          "name": "周兴审讯手册",
          "type": "审讯手册",
          "source": "第39章：第三十九章 无可奈何的情人",
          "summary": "周兴手册把恐吓、诱供、签押排成步骤，折角停在最狠的一页。",
          "detail": "这不是办案心得，是把人逼到认罪的说明。翻得越旧，越说明这套办法用得越熟。",
          "use": "它说明这不是审案经验，而是一套现成的逼供法。"
        },
        {
          "id": "case-urn-ev-5",
          "name": "魏元忠求援札",
          "type": "私人札记",
          "source": "第40章：第四十章 万人空巷的判决",
          "summary": "魏元忠求援札写得很急，字里夹着审讯室外的恐惧。",
          "detail": "它不只替狄仁杰喊冤，也说明旁人为什么沉默。酷吏最厉害的地方，是让没进暗室的人也不敢说话。",
          "use": "它让人明白，沉默也是被逼出来的。"
        },
        {
          "id": "case-urn-ev-pattern",
          "name": "瓮中审讯图",
          "type": "推理线索",
          "source": "由本案相关章节归纳",
          "summary": "把烙痕、供状和审讯手册放在一起，能看出逼供办法怎样反咬周兴。",
          "detail": "图上先是空瓮，再是手册折角，最后才是供状签押。顺序一排出来，自愿二字就站不稳了。",
          "use": "它把空瓮、手册和供状钉成了一整套逼供流程。"
        },
        {
          "id": "case-urn-ev-court-note",
          "name": "庭上追问记录",
          "type": "庭审线索",
          "source": "由庭审追问整理",
          "summary": "庭上记录写下了周兴解释不了的顺序：空瓮、手册、供状。",
          "detail": "三件东西分开看都能被狡辩，合在追问记录里就变成一套逼供步骤。",
          "use": "它把逼供的顺序摆到桌上，再难拆开。",
          "trialOnly": true
        },
        {
          "id": "case-urn-ev-pursuit-note",
          "name": "追击补记：瓮前签押",
          "type": "追击线索",
          "source": "由对照札记追击整理",
          "summary": "魏元忠补充：签押前，他听见瓮被拖到供案旁，随后才有人催狄仁杰落笔。",
          "detail": "这条补记把刑具和供状之间的距离缩到一步之内。周兴再难把二者拆开解释。",
          "use": "它盯住的，是供状为什么会在瓮边落笔。",
          "trialOnly": true,
          "pursuitOnly": true
        }
      ],
      "locations": [
        {
          "name": "御史台审讯室",
          "description": "御史台暗室门缝里透着冷灰味。空瓮被推到墙边，像审讯结束后还没来得及装作无事发生。",
          "sceneVariant": "site",
          "visualNote": "御史台暗室：审讯室、刑具阴影与反噬逻辑都摆在同一张案上。",
          "evidenceIds": [
            "case-urn-ev-1",
            "case-urn-ev-2"
          ],
          "talkTopics": [
            {
              "title": "供状太干净",
              "speaker": "魏元忠",
              "text": "人若真是自己认罪，笔下会停，会改，会怕。那份供状干净得像周兴替他想好了每一次喘气。"
            },
            {
              "title": "暗室外的声音",
              "speaker": "狄府旧吏",
              "text": "我听见瓮被拖过地，随后才有人喊签字。供状说是自愿，可暗室先替它说了另一句话。"
            }
          ],
          "examineSpots": [
            {
              "name": "空瓮烙痕",
              "text": "瓮口黑得不均匀，像火刚被撤走。它不是摆设，是让人想象自己被装进去的威胁。"
            },
            {
              "name": "地上的拖痕",
              "text": "拖痕一直到供案前停下。若只是问话，刑具不该离笔墨这么近。"
            }
          ]
        },
        {
          "name": "史官案牍房",
          "description": "供状副本摊开后，几处停笔像刻意排练过。真正乱的不是纸，是纸背后的审讯。",
          "sceneVariant": "archive",
          "visualNote": "案牍房里有旧账、旁注和被重新装订的纸页。",
          "evidenceIds": [
            "case-urn-ev-3",
            "case-urn-ev-4"
          ],
          "talkTopics": [
            {
              "title": "一模一样的话反复出现",
              "speaker": "史官",
              "text": "三份供状都在同一个地方说‘自愿’。越是拼命强调自愿，越像怕别人看见不自愿。"
            },
            {
              "title": "手册折角",
              "speaker": "誊录小吏",
              "text": "手册折在恐吓那页，不是偶然。办案的人常翻哪里，哪里就会先坏。"
            }
          ],
          "examineSpots": [
            {
              "name": "供状副本的停笔",
              "text": "停笔位置像被一套说辞卡住。不是犯人想不起，而是写字的人在等别人点头。"
            },
            {
              "name": "审讯手册折角",
              "text": "折角处有指腹油痕。周兴若说从未用过这套办法，这页纸会比他诚实。"
            }
          ]
        },
        {
          "name": "辩护席",
          "description": "辩护席上，供状、空瓮和手册被摆成三角。周兴最怕的不是你喊冤，是你让它们互相作证。",
          "sceneVariant": "defense",
          "visualNote": "辩护席上铺着证物、人物名牌和一张等待补完的线索板。",
          "evidenceIds": [
            "case-urn-ev-5",
            "case-urn-ev-pattern"
          ],
          "talkTopics": [
            {
              "title": "供状为什么不像供状",
              "speaker": "辩方",
              "text": "只说它是假，周兴立刻能把话推回来。瓮、火、手册和笔迹一并排，供状才会自己露出不是自愿写成的样子。"
            },
            {
              "title": "那套步骤是谁的",
              "speaker": "书记助手",
              "text": "周兴越熟那套恐吓流程，越像亲手用惯了它。手册一摊开，他就得把每一步怎么来的说清楚。"
            }
          ],
          "examineSpots": [
            {
              "name": "并排的三件证物",
              "text": "单看供状像认罪，单看空瓮像传闻，合起来才像一场被安排好的崩溃。"
            },
            {
              "name": "救援纸条",
              "text": "纸条来得太晚，却正好证明供状来得太快。有人在求救时，法庭已经准备相信签押了。"
            }
          ]
        }
      ],
      "timeline": [
        {
          "label": "卷宗36",
          "title": "第三十六章 请君入瓮种种",
          "note": "与“酷吏反噬、狄仁杰与魏元忠、继承争议”相关的阶段性线索。"
        },
        {
          "label": "卷宗37",
          "title": "第三十七章 狄仁杰与魏元忠",
          "note": "与“酷吏反噬、狄仁杰与魏元忠、继承争议”相关的阶段性线索。"
        },
        {
          "label": "卷宗38",
          "title": "第三十八章 仍然是接班人的麻烦",
          "note": "与“酷吏反噬、狄仁杰与魏元忠、继承争议”相关的阶段性线索。"
        },
        {
          "label": "卷宗39",
          "title": "第三十九章 无可奈何的情人",
          "note": "与“酷吏反噬、狄仁杰与魏元忠、继承争议”相关的阶段性线索。"
        },
        {
          "label": "卷宗40",
          "title": "第四十章 万人空巷的判决",
          "note": "与“酷吏反噬、狄仁杰与魏元忠、继承争议”相关的阶段性线索。"
        },
        {
          "label": "卷宗41",
          "title": "第四十一章 用贤之患",
          "note": "与“酷吏反噬、狄仁杰与魏元忠、继承争议”相关的阶段性线索。"
        }
      ],
      "testimony": [
        {
          "speaker": "魏元忠",
          "title": "证词一：表面原因",
          "mood": "cautious",
          "statements": [
            {
              "text": "我看见供状时，签押已经在上面。暗室里发生过什么，周兴说只是照规矩问话。",
              "press": "魏元忠看见的是签押后的结果，可那份供状干净得太假，像有人先把路扫平了。",
              "wrongEvidenceFeedback": "眼下还只是风声。案上的纸还没碰到真正伤人的地方。",
              "answerEvidence": null
            },
            {
              "text": "狄仁杰既已签押认罪，供状就是他自己的意思，和空瓮、手册都没有关系。",
              "press": "他把供状、空瓮和手册硬生生拆开，倒把那股不自然一起晾了出来。",
              "wrongEvidenceFeedback": "这份记录还没碰到“自愿签押”最要命的那层假。",
              "answerEvidence": "case-urn-ev-2",
              "pursuitUnlockStatementId": "case-urn-pursuit-surface",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。狄仁杰亲笔供状显示供状后半突然潦草，签押并不像证人说的那样从容自愿。"
            },
            {
              "text": "魏元忠补充说，签押前那口瓮已经被拖到供案旁边。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-urn-pursuit-surface",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-urn-ev-pursuit-note",
              "objection": "异议成立。追击补记：瓮前签押已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "我只知道他活着走出了审讯，不知道他在里面听见了什么。",
              "press": "人是活着走出来了，可那股暗室里的火气还没从供状上散掉。",
              "wrongEvidenceFeedback": "这里只露了一道缝，还没碰到案子最硬的骨头。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "周兴",
          "title": "证词二：合法性",
          "mood": "aggressive",
          "statements": [
            {
              "text": "御史台问案自有旧法，辩方不必把每一件刑具都说成逼供。",
              "press": "审讯越说得像普通问案，越要追问是谁设计了那口瓮。",
              "unlockStatementId": "case-urn-legality-branch",
              "wrongEvidenceFeedback": "周兴在把办法说成旧法。先追问，让他露出对流程的熟悉。",
              "answerEvidence": null
            },
            {
              "text": "御史台只是按旧例问案，周兴没有把逼供术当成办案诀窍。",
              "press": "他把逼供说成旧例，可人物档案一翻，就知道这套法子是谁琢磨出来的。",
              "hiddenUntilPressed": "case-urn-legality-branch",
              "revealLabel": "瓮中审讯的设计者",
              "wrongEvidenceFeedback": "这里该咬住的是周兴本人，不是哪件器物。先翻人物档案，拆掉他的旁听姿态。",
              "answerProfile": "周兴",
              "answerEvidence": null,
              "objection": "异议成立。周兴熟悉这套逼供办法，不能说自己只是按旧例旁听。"
            },
            {
              "text": "供状副本和手册只是办案材料，没有人照着它们逼人说出一模一样的供词。",
              "press": "他否认材料之间的关系。要反击，就指出手册和供状的步骤对得太整齐。",
              "wrongEvidenceFeedback": "需要能证明逼供流程被照着使用的证物。",
              "counterEvidence": "case-urn-ev-3",
              "counterRecoveryId": "case-urn-counter-recovery",
              "counterNotice": "酷吏话术反制",
              "counterFeedback": "周兴老想把人拽回单份供词的真假上。可只盯着那张纸，瓮、手册和逼供的顺序就都要被他撇开了。",
              "counterPenalty": 2,
              "answerEvidence": "case-urn-ev-4",
              "pursuitUnlockStatementId": "case-urn-pursuit-legality",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。周兴审讯手册把恐吓和认罪排成固定步骤，供状不是凭空写成的。"
            },
            {
              "text": "周兴说那只是旧法，却没有解释手册折角为什么正停在恐吓那页。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-urn-pursuit-legality",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-urn-ev-pursuit-note",
              "objection": "异议成立。追击补记：瓮前签押已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "周兴反制后留下了一个缺口：他只证明刚才那件证物不够，却没有解释后续动作是谁做的。",
              "press": "他刚躲过去的，不是结尾，是后手。那块空白还晾在案上。",
              "hiddenUntilPressed": "case-urn-counter-recovery",
              "revealLabel": "反制后的补救破绽",
              "optionalRecovery": true,
              "recoveryCredibility": 1,
              "wrongEvidenceFeedback": "刚才那道空白还挂在后面，没必要再回去碰已经塌掉的那页。",
              "answerEvidence": "case-urn-ev-4",
              "objection": "补救成立。周兴审讯手册避开刚才的漏洞，直接说明公开说法背后还有人动手整理。"
            },
            {
              "text": "最后留下签押的人是狄仁杰，这就足够证明供状有效。",
              "press": "签押是结果，不是过程。过程若被逼出来，签押反而成了逼供留下的痕迹。",
              "wrongEvidenceFeedback": "这番话滑得很，可真正伤人的地方还不在这里。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "御前书记",
          "title": "证词三：最终推理",
          "mood": "decisive",
          "statements": [
            {
              "text": "辩方摆出空瓮、供状、手册，却还没说明它们怎样合成一场逼供。",
              "press": "他说三件证物还连不成一场逼供，可它们彼此咬住的地方已经摆在案上。",
              "pressUnlockEvidence": "case-urn-ev-court-note",
              "wrongEvidenceFeedback": "案上的线还没拢成一处，这份记录压不住整场风波。",
              "answerEvidence": null
            },
            {
              "text": "空瓮、供状和手册只是同案材料，没有同一套逼供步骤把它们连起来。",
              "press": "恐吓、签押、手册折角一旦排成顺序，所谓散落材料就站不住了。",
              "wrongEvidenceFeedback": "单件证物各自发声，还压不住整套流程。",
              "answerEvidence": "case-urn-ev-court-note",
              "pursuitUnlockStatementId": "case-urn-pursuit-final",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。庭上追问记录说明三件证物合起来是一套流程：先让人害怕，再让供状看起来像自愿。"
            },
            {
              "text": "御前书记把顺序写清：先是瓮，再是手册，最后才是供状。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-urn-pursuit-final",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-urn-ev-pursuit-note",
              "objection": "异议成立。追击补记：瓮前签押已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "若不能证明流程存在，供状仍按有效记录处理。",
              "press": "他死咬没有流程，可那套流程已经从纸和瓮口里冒出来了。",
              "wrongEvidenceFeedback": "法官在催结果，可证词真正站不住的地方，还没被这份记录碰到。",
              "answerEvidence": null
            }
          ]
        }
      ]
    },
    {
      "id": "case-half-hour-coup",
      "title": "最终案：半小时政变",
      "chapters": [
        42,
        43,
        44,
        45
      ],
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
        "tone": "夜门、禁军脚步和半小时的沉默压缩成最后现场。"
      },
      "goal": "查明迎仙宫夜门半小时内发生了什么，说明张氏兄弟、莫须有罪名和神龙政变怎样连到一起。",
      "menuHook": "夜门被撞开的半小时里，口令、赏赐和罪名都来得太准。混乱不是答案，时间才是证人。",
      "openingStory": {
        "kicker": "夜门半小时",
        "title": "所有人都说来不及，可命令偏偏来得很准。",
        "body": "迎仙宫夜门一开，脚步声像水一样冲进廊下。张氏兄弟还没完全倒下，赏赐簿、换岗令和罪名纸条已经排队等着被承认。证人说那半小时太乱，可每一张纸都准得像提前看过结局。",
        "stakes": "人人都说那半小时太乱，可真正可怕的是，有人比别人更早知道结局。"
      },
      "introCards": [
        {
          "title": "半小时不该这么整齐",
          "body": "门刚开，口令、换岗和罪名就接上了，像有人提前排过表。"
        },
        {
          "title": "赏赐比解释更早",
          "body": "谁会赢还没说清，奖赏已经先记在簿上。"
        },
        {
          "title": "罪名纸条太短",
          "body": "越含糊的罪名，越方便在政变后塞给任何输家。"
        }
      ],
      "sourceStoryItems": [
        {
          "title": "夜门的更漏",
          "note": "半小时很短，却足够改变宫门、兵权和一条人命。时间是本案最冷静的证人。"
        },
        {
          "title": "赏赐簿先动了",
          "note": "赏赐来得太早，像是在事情结束前就知道谁会赢。"
        },
        {
          "title": "罪名纸条",
          "note": "纸条字少，分量却重。越含糊的罪名，越方便把人推下去。"
        },
        {
          "title": "禁军换岗令",
          "note": "换岗不是混乱里的小事。谁离开岗位，谁留下缺口，谁在终局前忽然沉默，半小时里都有人算过。"
        }
      ],
      "openingLines": [
        {
          "speaker": "玄宗旧部",
          "text": "夜门被撞开的那一刻，宫里只剩急促脚步。证人说半小时足够改朝，却说不清罪名从何而来。"
        },
        {
          "speaker": "辩方",
          "text": "半小时不是空白。谁被保护、谁被推出去、谁突然失去耐心，都藏在这段时间里。"
        },
        {
          "speaker": "张易之",
          "text": "乱夜里人人自保。辩方若硬说有人提前安排，就请拿出比脚步声更准的证据。"
        }
      ],
      "verdict": "政变看似短促，实则由长期积累的宫廷不满、继承压力和近臣失控共同推成。",
      "branch": {
        "revealLabel": "夜门沉默的受益者",
        "triggerPress": "半小时的沉默不是空白，而是在掩护谁从宠臣变成众矢之的。",
        "hiddenText": "迎仙宫夜门的沉默与张易之无关，他只是被局势裹挟的旁观者。",
        "hiddenPress": "他把自己摆成看热闹的，可真正得利的人，从头到尾都没离开这盘局。翻档案。"
      },
      "trap": {
        "evidenceIndex": 0,
        "notice": "夜门时间反制",
        "risk": "这份时间线只能证明行动很快，不能直接说明罪名是谁编出来的。",
        "feedback": "张易之抓住辩方只谈夜门时间的弱点：半小时本身只能证明行动迅速，不能直接说明罪名如何被制造。"
      },
      "index": 5,
      "badEnding": "若无法推翻这组证词，张氏兄弟、莫须有罪名与神龙政变会被写成单一罪名。被迫沉默的宫廷证人的沉默将成为定案理由，真正该查的人会躲在案卷后面。",
      "pressureBeats": {
        "danger": {
          "label": "危险",
          "title": "夜门倒计时",
          "body": "再失误，半小时政变会被写成偶发夜变，张氏兄弟与合法性危机的联系会断开。",
          "opponentLine": "张易之抓住沉默逼问：辩方若无法证明临界点，夜门只是一场无源风波。"
        },
        "final-warning": {
          "label": "最后警告",
          "title": "半小时即将封卷",
          "body": "最后庭审只剩一次翻盘窗口。必须说明宠幸、朝臣耐心和禁军行动怎样汇成政变。",
          "opponentLine": "张易之催促封卷：再无决定性证物，半小时只会成为反对者的借口。"
        }
      },
      "turnaboutBeat": {
        "title": "夜门逆转开锁",
        "body": "关键证物把宠幸、朝臣耐心和禁军行动压到同一刻，半小时不再是偶发夜变。",
        "opponentLine": "张易之无法再把沉默说成空白：夜门时间已经成为合法性崩塌的证词。",
        "recovery": 1
      },
      "sources": [
        "第四十二章 两个男情妇",
        "第四十三章 其实莫须有",
        "第四十四章 不肯牺牲情郎",
        "第四十五章 精彩的半小时政变"
      ],
      "evidence": [
        {
          "id": "case-half-hour-coup-ev-1",
          "name": "夜门更漏牌",
          "type": "时间记录",
          "source": "第42章：第四十二章 两个男情妇",
          "summary": "夜门更漏牌记下半小时，口令却在半小时内换了三次。",
          "detail": "它只证明时间太准，还不能证明罪名从哪来。若太早出示，张易之会把它说成临时应变。",
          "use": "它先把那半小时的齿轮卡住了。",
          "counterRisk": "这份时间线只能证明行动很快，不能直接说明罪名是谁编出来的。",
          "counterNotice": "夜门时间反制"
        },
        {
          "id": "case-half-hour-coup-ev-2",
          "name": "张氏兄弟赏赐簿",
          "type": "宫廷账册",
          "source": "第43章：第四十三章 其实莫须有",
          "summary": "赏赐簿名字越写越密，旁边几张奏报却被抽走。",
          "detail": "奖赏留了下来，奖赏的理由不见了。有人想让法庭只看谁赢，不看谁早知道会赢。",
          "use": "它把谁在夜变前后得了好处写得很清楚。"
        },
        {
          "id": "case-half-hour-coup-ev-3",
          "name": "莫须有罪名纸条",
          "type": "罪名草稿",
          "source": "第44章：第四十四章 不肯牺牲情郎",
          "summary": "罪名纸条先写结论，后补理由，几个词被反复换掉。",
          "detail": "它不像证据，更像给结局贴上的标签。越短，越方便把任何人塞进去。",
          "use": "它逼人去看罪名是谁先写下来的。"
        },
        {
          "id": "case-half-hour-coup-ev-4",
          "name": "禁军换岗令",
          "type": "军令",
          "source": "第45章：第四十五章 精彩的半小时政变",
          "summary": "禁军换岗令签押很急，路线却安排得过于顺手。",
          "detail": "急不等于乱。几队人被调到正好该出现的位置，像有人早看过半小时后的地图。",
          "use": "它说明人手不是乱撞过去的，而是早摆好了。"
        },
        {
          "id": "case-half-hour-coup-ev-pattern",
          "name": "夜门半小时图",
          "type": "推理线索",
          "source": "由本案相关章节归纳",
          "summary": "把更漏牌、赏赐簿、罪名纸条和换岗令连起来，能看出政变不是凭空发生。",
          "detail": "半小时被切成开门、换岗、定罪、赏赐四段。每段都说自己仓促，连起来却准得反常。",
          "use": "它让那半小时自己开了口：这不是乱，是早有安排。"
        },
        {
          "id": "case-half-hour-coup-ev-court-note",
          "name": "庭上追问记录",
          "type": "庭审线索",
          "source": "由庭审追问整理",
          "summary": "追问记录把夜门半小时拆成了四段：开门、换岗、定罪、赏赐。",
          "detail": "每段都能被说成仓促，连起来却像早排好的表。时间替辩方留下了证词。",
          "use": "它说明半小时里的每一步，都有人提前等着。",
          "trialOnly": true
        },
        {
          "id": "case-half-hour-coup-ev-pursuit-note",
          "name": "追击补记：夜门先令",
          "type": "追击线索",
          "source": "由对照札记追击整理",
          "summary": "玄宗旧部承认，夜门撞开前已有一道口令先传到侧门，换岗并非完全临时。",
          "detail": "补记让半小时时间表多出起点。真正的安排不是门开后才开始，而是在门开前已经动了。",
          "use": "它盯住的，是谁在夜门未开前就把结局排好了。",
          "trialOnly": true,
          "pursuitOnly": true
        }
      ],
      "locations": [
        {
          "name": "迎仙宫夜门",
          "description": "迎仙宫夜门外，灯影还没散。更漏牌停在半小时里，禁军却已经换过两道口令。",
          "sceneVariant": "site",
          "visualNote": "迎仙宫夜门：夜门、禁军脚步和半小时的沉默压缩成最后现场。",
          "evidenceIds": [
            "case-half-hour-coup-ev-1",
            "case-half-hour-coup-ev-2"
          ],
          "talkTopics": [
            {
              "title": "半小时够做什么",
              "speaker": "玄宗旧部",
              "text": "若真是一团乱，没人会把赏赐簿写得那么稳。乱的是门外，稳的是早知道该奖谁的人。"
            },
            {
              "title": "张氏兄弟在哪里",
              "speaker": "禁军校尉",
              "text": "他们还没被押走时，换岗令已经传到第二道门。命令走得比人快，才是这案子最怪的地方。"
            }
          ],
          "examineSpots": [
            {
              "name": "夜门更漏牌",
              "text": "更漏牌只记时辰，不替谁圆谎。半小时内出现三道口令，说明有人提前知道该往哪儿调人。"
            },
            {
              "name": "门轴上的新划痕",
              "text": "划痕很新，却不是撞门留下的。有人在开门前就试过门缝，像在确认路线。"
            }
          ]
        },
        {
          "name": "史官案牍房",
          "description": "赏赐簿、换岗令和罪名纸条排在一起，像三封提前写好的结局。",
          "sceneVariant": "archive",
          "visualNote": "案牍房里有旧账、旁注和被重新装订的纸页。",
          "evidenceIds": [
            "case-half-hour-coup-ev-3",
            "case-half-hour-coup-ev-4"
          ],
          "talkTopics": [
            {
              "title": "赏赐为何先到",
              "speaker": "史官",
              "text": "赏赐簿不该跑在审问前面。谁能先写赏赐，谁就不是事后才知道谁会赢。"
            },
            {
              "title": "罪名纸条太短",
              "speaker": "誊录小吏",
              "text": "短不是问题，短得刚好能塞进任何结论才是问题。它不像证据，像给结局找的标签。"
            }
          ],
          "examineSpots": [
            {
              "name": "抽走奏报的空痕",
              "text": "赏赐簿旁边缺了几张奏报。有人保留了奖赏，拿走了奖赏从何而来的解释。"
            },
            {
              "name": "换岗令签押",
              "text": "签押压得很重，墨点飞到边上。传令的人很急，但急不等于临时。"
            }
          ]
        },
        {
          "name": "辩护席",
          "description": "辩护席把半小时拆成几段：开门、换岗、定罪、赏赐。顺序一旦对不上，所谓混乱也就站不住了。",
          "sceneVariant": "defense",
          "visualNote": "辩护席上铺着证物、人物名牌和一张等待补完的线索板。",
          "evidenceIds": [
            "case-half-hour-coup-ev-pattern"
          ],
          "talkTopics": [
            {
              "title": "混乱背后的顺序",
              "speaker": "辩方",
              "text": "越是人人都喊乱，越要去看时辰。更漏牌不替谁说话，却会把谁早知道后手这件事照得很亮。"
            },
            {
              "title": "最后问谁受益",
              "speaker": "书记助手",
              "text": "夜门是谁撞开的，不一定是最后答案。半小时后谁拿到好处，谁才最怕时间被排清楚。"
            }
          ],
          "examineSpots": [
            {
              "name": "半小时分段图",
              "text": "每一段都能单独解释，合起来却太整齐。真正的突破点，是整齐本身。"
            },
            {
              "name": "张易之名牌",
              "text": "名牌被推到角落，却仍压住几张赏赐记录。对手越装作自己只是被卷入，越要看他压住了什么。"
            }
          ]
        }
      ],
      "timeline": [
        {
          "label": "卷宗42",
          "title": "第四十二章 两个男情妇",
          "note": "与“张氏兄弟、莫须有罪名与神龙政变”相关的阶段性线索。"
        },
        {
          "label": "卷宗43",
          "title": "第四十三章 其实莫须有",
          "note": "与“张氏兄弟、莫须有罪名与神龙政变”相关的阶段性线索。"
        },
        {
          "label": "卷宗44",
          "title": "第四十四章 不肯牺牲情郎",
          "note": "与“张氏兄弟、莫须有罪名与神龙政变”相关的阶段性线索。"
        },
        {
          "label": "卷宗45",
          "title": "第四十五章 精彩的半小时政变",
          "note": "与“张氏兄弟、莫须有罪名与神龙政变”相关的阶段性线索。"
        }
      ],
      "testimony": [
        {
          "speaker": "玄宗旧部",
          "title": "证词一：表面原因",
          "mood": "cautious",
          "statements": [
            {
              "text": "夜门那半小时乱得没人能看清。我只知道张氏兄弟倒下后，新命令很快就来了。",
              "press": "玄宗旧部口口声声说乱，可命令来得那样快，快得像有人早把时辰掐好了。",
              "wrongEvidenceFeedback": "眼下还只是风声。案上的纸还没碰到真正伤人的地方。",
              "answerEvidence": null
            },
            {
              "text": "禁军只是临时应变，赏赐和换岗都是事后补办，和谁预先安排没有关系。",
              "press": "他把过分整齐的顺序说成临时应变，反倒让那张时间表更扎眼。",
              "wrongEvidenceFeedback": "这份记录还没碰到“事后补办”最要命的那层假。",
              "answerEvidence": "case-half-hour-coup-ev-2",
              "pursuitUnlockStatementId": "case-half-hour-coup-pursuit-surface",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。张氏兄弟赏赐簿记录半小时内连换口令，禁军行动不是事后才补出来的。"
            },
            {
              "text": "玄宗旧部承认，夜门撞开前，侧门已经先收到一道换岗口令。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-half-hour-coup-pursuit-surface",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-half-hour-coup-ev-pursuit-note",
              "objection": "异议成立。追击补记：夜门先令已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "我只看见门开、人散、命令传来。谁先知道结局，我不敢说。",
              "press": "他不敢说谁先知道结局，可那份心虚已经先从话里漏出来了。",
              "wrongEvidenceFeedback": "这里只露了一道缝，还没碰到案子最硬的骨头。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "张易之",
          "title": "证词二：合法性",
          "mood": "aggressive",
          "statements": [
            {
              "text": "神龙之夜本就仓促，辩方再问谁先写纸条、谁先调兵，只是在拖延。",
              "press": "半小时的沉默不是空白，而是在掩护谁从宠臣变成众矢之的。",
              "unlockStatementId": "case-half-hour-coup-legality-branch",
              "wrongEvidenceFeedback": "张易之正在把所有异常塞进“仓促”。先追问，逼出隐藏证词。",
              "answerEvidence": null
            },
            {
              "text": "迎仙宫夜门的沉默与张易之无关，他只是被局势裹挟的旁观者。",
              "press": "他把自己摆成看热闹的，可真正得利的人，从头到尾都没离开这盘局。翻档案。",
              "hiddenUntilPressed": "case-half-hour-coup-legality-branch",
              "revealLabel": "夜门沉默的受益者",
              "wrongEvidenceFeedback": "真正藏着的是张易之拿好处的位置。翻人物档案，比单件证物更见血。",
              "answerProfile": "张易之",
              "answerEvidence": null,
              "objection": "异议成立。张易之不是被局势裹挟的旁观者，他的名牌一直压在赏赐记录上。"
            },
            {
              "text": "罪名纸条和换岗令只是混乱中的补救，没有人提前排好半小时后的结局。",
              "press": "他把整齐的顺序说成补救。要反击，就让时间表说话。",
              "wrongEvidenceFeedback": "需要能显示半小时内安排过于准确的证物。",
              "counterEvidence": "case-half-hour-coup-ev-1",
              "counterRecoveryId": "case-half-hour-coup-counter-recovery",
              "counterNotice": "夜门时间反制",
              "counterFeedback": "张易之抓住辩方只谈夜门时间的弱点：半小时本身只能证明行动迅速，不能直接说明罪名如何被制造。",
              "counterPenalty": 2,
              "answerEvidence": "case-half-hour-coup-ev-4",
              "pursuitUnlockStatementId": "case-half-hour-coup-pursuit-legality",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。禁军换岗令显示罪名先写结论后补理由，这不是仓促补救，是给结局找标签。"
            },
            {
              "text": "张易之说是临时补救，却说不清罪名纸条为何先写结论。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-half-hour-coup-pursuit-legality",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-half-hour-coup-ev-pursuit-note",
              "objection": "异议成立。追击补记：夜门先令已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "张易之反制后留下了一个缺口：他只证明刚才那件证物不够，却没有解释后续动作是谁做的。",
              "press": "他刚躲过去的，不是结尾，是后手。那块空白还晾在案上。",
              "hiddenUntilPressed": "case-half-hour-coup-counter-recovery",
              "revealLabel": "反制后的补救破绽",
              "optionalRecovery": true,
              "recoveryCredibility": 1,
              "wrongEvidenceFeedback": "刚才那道空白还挂在后面，没必要再回去碰已经塌掉的那页。",
              "answerEvidence": "case-half-hour-coup-ev-4",
              "objection": "补救成立。禁军换岗令避开刚才的漏洞，直接说明公开说法背后还有人动手整理。"
            },
            {
              "text": "最后新政令顺利传下，说明前面所有判断都是必要的。",
              "press": "顺利只说明胜者动作快，不能证明动作没有预先安排。",
              "wrongEvidenceFeedback": "这番话滑得很，可真正伤人的地方还不在这里。",
              "answerEvidence": null
            }
          ]
        },
        {
          "speaker": "御前书记",
          "title": "证词三：最终推理",
          "mood": "decisive",
          "statements": [
            {
              "text": "辩方拆了更漏、赏赐、罪名、换岗，却还没说清谁把半小时排成了结局。",
              "press": "他说不清谁把半小时排成结局，可每一段时辰都已经朝同一个方向靠过去了。",
              "pressUnlockEvidence": "case-half-hour-coup-ev-court-note",
              "wrongEvidenceFeedback": "案上的线还没拢成一处，这份记录压不住整场风波。",
              "answerEvidence": null
            },
            {
              "text": "这些安排只是混乱中接连发生，没有同一个受益者，也没有同一张时间表。",
              "press": "开门、换岗、定罪、赏赐一并排开，整齐得已经不像混乱。",
              "wrongEvidenceFeedback": "单件证物各自有分量，还压不住这半小时的整张表。",
              "answerEvidence": "case-half-hour-coup-ev-court-note",
              "pursuitUnlockStatementId": "case-half-hour-coup-pursuit-final",
              "pursuitUnlockLabel": "追击后的补充证词",
              "objection": "异议成立。庭上追问记录显示半小时不是混乱的借口，而是一张被提前排好的时间表。"
            },
            {
              "text": "御前书记补记：半小时不是混乱的空白，而是一张被提前排好的表。",
              "press": "这番补话不是临时想起，是被追到退无可退才漏出来的。案边那页追击补记，已经和它扣在一起。",
              "hiddenUntilPressed": "case-half-hour-coup-pursuit-final",
              "revealLabel": "追击后的补充证词",
              "requiredAfterUnlock": true,
              "wrongEvidenceFeedback": "他这会儿改口，不是普通证物能轻轻带过去的。案边那页追击补记，正压着他新漏出来的话。",
              "answerEvidence": "case-half-hour-coup-ev-pursuit-note",
              "objection": "异议成立。追击补记：夜门先令已经把他刚改的口供钉死了，证人别想再退回去。"
            },
            {
              "text": "若辩方说不清这张时间表，夜门案就只能按既成事实封卷。",
              "press": "他把“没有时间表”挂在嘴边，可那张表早就在夜门前摊开了。",
              "wrongEvidenceFeedback": "法官在催结果，可证词真正站不住的地方，还没被这份记录碰到。",
              "answerEvidence": null
            }
          ]
        }
      ]
    }
  ],
  "profiles": [
    {
      "name": "武则天",
      "role": "案件核心人物",
      "portrait": "empress",
      "note": "所有案件围绕她的权力上升、统治技术与晚年危机展开。"
    },
    {
      "name": "狄仁杰",
      "role": "关键辩方人物",
      "portrait": "minister",
      "note": "在酷吏政治与继承争议中维持判断力。"
    },
    {
      "name": "来俊臣",
      "role": "酷吏代表",
      "portrait": "censor",
      "note": "象征告密、酷刑和冤案生产机制。"
    },
    {
      "name": "张易之",
      "role": "最终案对手",
      "portrait": "favorite",
      "note": "晚年宫廷宠幸与政变导火索之一。"
    },
    {
      "name": "内廷记录官",
      "role": "本案证人",
      "portrait": "survivor",
      "note": "与“宫廷后位之争、婴儿死亡疑云与元老反对”直接相关，庭审中可能成为拆穿证词责任归属的关键人物。"
    },
    {
      "name": "许敬宗",
      "role": "本案对手",
      "portrait": "censor",
      "note": "与“宫廷后位之争、婴儿死亡疑云与元老反对”直接相关，庭审中可能成为拆穿证词责任归属的关键人物。"
    },
    {
      "name": "邠王守礼",
      "role": "本案证人",
      "portrait": "survivor",
      "note": "与“太子处境、皇子命运与高宗末期权力交接”直接相关，庭审中可能成为拆穿证词责任归属的关键人物。"
    },
    {
      "name": "宫廷书记官",
      "role": "本案对手",
      "portrait": "censor",
      "note": "与“太子处境、皇子命运与高宗末期权力交接”直接相关，庭审中可能成为拆穿证词责任归属的关键人物。"
    },
    {
      "name": "告密人",
      "role": "本案证人",
      "portrait": "censor",
      "note": "与“女皇登基、徐敬业起兵、告密制度与酷吏政治”直接相关，庭审中可能成为拆穿证词责任归属的关键人物。"
    },
    {
      "name": "魏元忠",
      "role": "本案证人",
      "portrait": "minister",
      "note": "与“酷吏反噬、狄仁杰与魏元忠、继承争议”直接相关，庭审中可能成为拆穿证词责任归属的关键人物。"
    },
    {
      "name": "周兴",
      "role": "本案对手",
      "portrait": "censor",
      "note": "与“酷吏反噬、狄仁杰与魏元忠、继承争议”直接相关，庭审中可能成为拆穿证词责任归属的关键人物。"
    },
    {
      "name": "玄宗旧部",
      "role": "本案证人",
      "portrait": "survivor",
      "note": "与“张氏兄弟、莫须有罪名与神龙政变”直接相关，庭审中可能成为拆穿证词责任归属的关键人物。"
    }
  ]
};

import type { HeroScene } from '../lib/heroAppearance';

/** Filled campaign artwork, for the banner and editable campaign previews. */
export default function SeasonalIllustration({ scene }: { scene: HeroScene }) {
  const paper = 'var(--season-paper, #fffaf0)';
  const gold = 'var(--season-highlight, #dba85c)';
  let art;
  switch (scene) {
    case 'winter': art = <>
      <circle cx="156" cy="151" r="101" fill="currentColor" opacity=".12" />
      <path d="M15 260L86 144L111 182L170 83L282 260Z" fill="currentColor" opacity=".28" />
      <path d="M170 83L166 233L225 260H282Z M86 144L80 234L128 260H161Z" fill="currentColor" opacity=".16" />
      <path d="M130 150L170 83L213 151L185 137L170 152L151 136Z M60 187L86 144L111 182L93 174L82 190Z" fill={paper} />
      <path d="M224 231V188M209 213L224 190L239 213M213 201L224 182L235 201M254 238V208M244 224L254 205L264 224" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 258Q64 219 131 248T288 243Q300 267 281 288Q160 305 31 291Q9 285 12 258Z" fill="currentColor" opacity=".45" />
      <path d="M14 278Q98 238 172 269T286 266Q297 286 273 292Q143 309 34 291Q18 288 14 278Z" fill={paper} />
      <path d="M57 280Q113 268 153 278M185 286Q219 292 251 283" stroke="currentColor" strokeWidth="1.5" opacity=".35" strokeLinecap="round" />
      <g data-season-detail="frost" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M75 35V105M45 52L105 88M45 88L105 52M65 42L75 52L85 42M65 98L75 88L85 98M235 96V136M218 106L252 126M218 126L252 106" /></g>
      <g fill={paper}><circle cx="212" cy="44" r="4"/><circle cx="37" cy="148" r="3"/><circle cx="257" cy="182" r="5"/></g>
    </>; break;
    case 'spring': art = <>
      <path d="M42 300Q51 160 191 38Q228 185 42 300" fill="currentColor" opacity=".18" />
      <path d="M76 300Q132 163 214 95M130 205Q54 204 52 145Q109 143 130 205M164 155Q224 153 250 99Q190 91 164 155" fill="currentColor" opacity=".65" />
      <g data-season-detail="bloom" fill={gold} transform="translate(105 112)"><ellipse rx="20" ry="44"/><ellipse rx="20" ry="44" transform="rotate(60)"/><ellipse rx="20" ry="44" transform="rotate(120)"/><circle r="15" fill={paper}/></g>
      <g fill="currentColor" transform="translate(225 217) rotate(15)"><ellipse rx="13" ry="29"/><ellipse rx="13" ry="29" transform="rotate(60)"/><ellipse rx="13" ry="29" transform="rotate(120)"/><circle r="9" fill={paper}/></g>
      <path d="M74 160L123 200M177 143L226 113M92 269Q129 219 154 189" fill="none" stroke={paper} strokeWidth="1.8" opacity=".7" strokeLinecap="round" />
      <g fill="currentColor" opacity=".65"><circle cx="100" cy="109" r="2.2"/><circle cx="110" cy="114" r="2.2"/><circle cx="104" cy="118" r="1.8"/></g>
      <path d="M26 240Q140 270 275 241" fill="none" stroke="currentColor" opacity=".3"/>
    </>; break;
    case 'summer': art = <>
      <circle cx="160" cy="118" r="88" fill="currentColor" opacity=".13"/>
      <circle data-season-detail="sunlight" cx="160" cy="118" r="61" fill={gold}/>
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M160 13V34M160 202V222M55 118H76M244 118H265M86 44L101 60M220 178L235 194M86 194L101 178M220 60L235 44"/></g>
      <path d="M12 215Q85 152 179 213T288 205L282 282Q154 304 24 282Z" fill="currentColor" opacity=".3"/>
      <path d="M16 246Q67 195 164 239T284 225L281 283Q154 307 25 282Z" fill={paper}/>
      <path d="M24 272Q106 234 206 272T278 267M64 285Q138 270 206 286" fill="none" stroke="currentColor" strokeWidth="2" opacity=".55" strokeLinecap="round"/>
      <path d="M119 95A47 47 0 0 1 155 72" stroke={paper} strokeWidth="3" opacity=".75" strokeLinecap="round" />
    </>; break;
    case 'autumn': art = <>
      <circle cx="151" cy="151" r="112" fill="currentColor" opacity=".1"/>
      <path d="M45 300Q136 165 228 27" fill="none" stroke={gold} strokeWidth="5"/>
      <path d="M112 207Q28 184 42 111Q109 123 112 207M158 140Q162 47 231 35Q253 112 158 140M77 252Q13 252 8 199Q65 191 77 252" fill="currentColor" opacity=".8"/>
      <path data-season-detail="copper" d="M130 187Q207 182 242 128Q161 121 130 187M181 102Q149 63 164 12Q206 41 181 102" fill={gold}/>
      <path d="M44 113L111 205M231 36L158 139M241 129L132 186" fill="none" stroke={paper} strokeWidth="2" opacity=".65"/>
      <path d="M72 151L87 150M78 166L95 165M185 104L183 85M194 91L195 72M167 176L183 171" stroke={paper} strokeWidth="1.5" opacity=".6" strokeLinecap="round" />
      <path d="M216 249Q249 227 269 244Q252 268 216 249Z" fill={gold} opacity=".55"/>
      <path d="M218 251L264 243" stroke="currentColor" strokeWidth="1.5" opacity=".6" />
    </>; break;
    case 'new-year': art = <>
      <circle cx="150" cy="152" r="108" fill="none" stroke="currentColor" opacity=".2"/>
      <path data-season-detail="spark" d="M150 40L168 112L240 130L168 149L150 222L132 149L59 130L132 112Z" fill={gold}/>
      <path d="M229 194L238 222L266 231L238 240L229 268L220 240L192 231L220 222Z" fill="currentColor"/>
      <path d="M51 44L60 68L84 77L60 86L51 110L42 86L18 77L42 68Z" fill="currentColor" opacity=".65"/>
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M39 224Q18 199 43 179M218 35Q247 24 257 48M99 250L107 275M260 131L280 124"/></g>
      <circle cx="119" cy="34" r="4" fill={paper}/><circle cx="167" cy="266" r="5" fill={gold}/>
      <path d="M52 170A102 102 0 0 0 127 251M182 50A104 104 0 0 1 250 125" fill="none" stroke={gold} strokeWidth="1.5" opacity=".45" strokeLinecap="round" />
      <g fill="none" stroke="currentColor" strokeWidth="2" opacity=".55"><circle cx="43" cy="137" r="5"/><circle cx="269" cy="174" r="4"/></g>
    </>; break;
    case 'ramadan': art = <>
      <path d="M35 300V150Q35 74 150 18Q265 74 265 150V300Z" fill="currentColor" opacity=".1"/>
      <path d="M56 300V152Q56 93 150 44Q244 93 244 152V300" fill="none" stroke="currentColor" opacity=".35" strokeWidth="2"/>
      <path d="M170 65A70 70 0 1 0 222 176A63 63 0 0 1 170 65Z" fill={gold}/>
      <g data-season-detail="lanterns">
        <g data-season-part="lantern-high">
          <path d="M218 0V62" stroke="currentColor" strokeWidth="2"/>
          <path d="M205 72L218 58L231 72L242 125L218 146L194 125Z" fill="currentColor"/>
          <path d="M210 84H226V120H210Z" fill={paper}/>
          <path d="M218 84V120M202 128H234M207 76H229" stroke={gold} strokeWidth="2"/>
        </g>
        <g data-season-part="lantern-low">
          <path d="M76 0V108" stroke="currentColor" strokeWidth="2"/>
          <path d="M66 119L76 107L86 119L94 160L76 176L58 160Z" fill="currentColor"/>
          <path d="M70 130H82V157H70Z" fill={paper}/>
          <path d="M76 130V157M64 162H88" stroke={gold} strokeWidth="1.5"/>
        </g>
      </g>
      <path d="M139 117A49 49 0 0 0 187 178" fill="none" stroke={paper} strokeWidth="1.5" opacity=".45"/>
      <path d="M105 66L109 77L120 81L109 85L105 96L101 85L90 81L101 77Z" fill={gold}/>
    </>; break;
    case 'eid': art = <>
      <circle cx="152" cy="159" r="108" fill="currentColor" opacity=".12"/>
      <g transform="rotate(-8 150 170)"><path d="M60 133H240V265H60Z" fill="currentColor" opacity=".65"/><path d="M46 113H254V153H46Z" fill="currentColor"/><path d="M136 114H164V265H136Z" fill={gold}/><path data-season-detail="ribbon" d="M150 113Q59 113 81 68Q108 27 150 113Q191 27 219 68Q242 113 150 113" fill="none" stroke={gold} strokeWidth="13" strokeLinecap="round"/><path d="M71 165V253H127M176 165H229" fill="none" stroke={paper} strokeWidth="2" opacity=".4" strokeLinecap="round"/><path d="M105 95Q90 80 97 72M181 96Q200 78 207 81" fill="none" stroke={paper} strokeWidth="2.5" opacity=".65" strokeLinecap="round"/></g>
      <path d="M52 34L58 50L74 56L58 62L52 78L46 62L30 56L46 50ZM250 58L254 69L265 73L254 77L250 88L246 77L235 73L246 69Z" fill={gold}/>
    </>; break;
    case 'holiday': art = <>
      <path d="M56 300V143A96 96 0 0 1 248 143V300Z" fill="currentColor" opacity=".15"/>
      <circle cx="176" cy="106" r="42" fill={gold}/>
      <path d="M22 194Q49 160 93 192T195 192T282 192V278Q155 310 22 280Z" fill="currentColor" opacity=".45"/>
      <path d="M22 229Q49 191 98 229T196 229T282 229V278Q155 310 22 280Z" fill={paper}/>
      <path data-season-detail="tide" d="M27 262Q49 224 98 262T196 262T278 262" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M111 168L136 134V171ZM141 147L158 171H141Z M109 176H161L153 184H119Z" fill={paper} opacity=".9"/>
      <path d="M62 90Q77 76 92 90Q107 76 122 90" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </>; break;
    case 'school': art = <>
      <g transform="rotate(-10 145 155)"><rect x="48" y="53" width="166" height="220" rx="12" fill="currentColor" opacity=".23"/><rect x="63" y="37" width="166" height="220" rx="12" fill={paper}/><path d="M86 37V257" stroke="currentColor" opacity=".45" strokeWidth="3"/><path data-season-detail="rules" d="M107 95H202M107 122H202M107 149H189M107 176H197M107 203H166" stroke="currentColor" strokeWidth="3" opacity=".55"/><path d="M163 37H193V88L178 77L163 88Z" fill={gold}/><path d="M53 75H76M53 109H76M53 143H76M53 177H76M53 211H76" stroke={gold} strokeWidth="3" strokeLinecap="round"/></g>
      <g transform="rotate(20 239 174)"><path d="M230 81H247V238L239 261L230 238Z" fill="currentColor"/><path d="M230 238H247L239 261Z" fill={gold}/><path d="M235 94V226" stroke={paper} strokeWidth="2" opacity=".6" strokeLinecap="round"/></g>
    </>; break;
    case 'weekend': art = <>
      <g transform="rotate(-12 150 155)"><path d="M26 76H274V129A23 23 0 0 0 274 175V228H26V175A23 23 0 0 0 26 129Z" fill="currentColor" opacity=".2"/><path d="M42 91H258V129A23 23 0 0 0 258 175V213H42V175A23 23 0 0 0 42 129Z" fill={paper}/><path d="M210 94V211" stroke="currentColor" strokeWidth="2" strokeDasharray="5 7"/><g data-season-detail="ticket-ink" fill="none" stroke="currentColor" strokeLinecap="round"><path d="M84 123L122 182L160 123" strokeWidth="8"/><path d="M228 117H243M228 131H243M228 181H243M228 195H243" strokeWidth="2"/><path d="M79 198H166" strokeWidth="1.5" opacity=".5"/></g></g>
      <path d="M68 30L75 46L91 53L75 60L68 76L61 60L45 53L61 46Z" fill={gold}/>
    </>; break;
    case 'black-friday': art = <>
      <g transform="rotate(-13 150 150)"><rect x="29" y="33" width="244" height="244" rx="32" fill="currentColor" opacity=".14"/><rect x="43" y="47" width="216" height="216" rx="23" fill="currentColor"/><path d="M57 65H245M57 245H245" stroke={paper} strokeWidth="1" opacity=".25"/><g fill="none" stroke={paper} strokeWidth="16" strokeLinecap="round"><circle cx="111" cy="111" r="23"/><circle cx="190" cy="192" r="23"/><path d="M102 209L198 92"/></g><path data-season-detail="foil" d="M227 46H259V78Z" fill={gold}/><path d="M57 89V225" fill="none" stroke={paper} strokeWidth="1.5" opacity=".3" strokeLinecap="round"/></g>
    </>; break;
    case 'season-end': art = <>
      <g transform="rotate(-20 150 150)"><path d="M78 54H204V196L141 253L78 196Z" fill="currentColor" opacity=".2"/><path d="M100 38H226V180L163 237L100 180Z" fill="currentColor"/><circle cx="163" cy="68" r="10" fill={paper}/><path data-season-detail="thread" d="M163 58Q87 -2 69 45Q61 77 103 83" fill="none" stroke={gold} strokeWidth="4"/><path d="M130 113H196M130 133H196M146 160H179" stroke={paper} strokeWidth="3"/><path d="M111 93V176L163 223L215 176V50" fill="none" stroke={paper} strokeWidth="1.5" opacity=".35"/><circle cx="163" cy="68" r="15" fill="none" stroke={gold} strokeWidth="1.5" opacity=".6"/></g>
      <path d="M39 234H94M45 249H79M218 245H267" stroke={gold} strokeWidth="3" strokeLinecap="round"/>
    </>; break;
    default: return null;
  }
  return <svg viewBox="0 0 300 300" fill="none" aria-hidden="true" focusable="false" data-season-illustration={scene}>{art}</svg>;
}

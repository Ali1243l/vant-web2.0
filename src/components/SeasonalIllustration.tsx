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
      <path d="M130 150L170 83L213 151L185 137L170 152L151 136Z M60 187L86 144L111 182L93 174L82 190Z" fill={paper} />
      <path d="M0 258Q64 219 131 248T300 237V300H0Z" fill="currentColor" opacity=".45" />
      <path d="M0 278Q98 238 172 269T300 260V300H0Z" fill={paper} />
      <g data-season-detail="frost" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M75 35V105M45 52L105 88M45 88L105 52M65 42L75 52L85 42M65 98L75 88L85 98M235 96V136M218 106L252 126M218 126L252 106" /></g>
      <g fill={paper}><circle cx="212" cy="44" r="4"/><circle cx="37" cy="148" r="3"/><circle cx="257" cy="182" r="5"/></g>
    </>; break;
    case 'spring': art = <>
      <path d="M42 300Q51 160 191 38Q228 185 42 300" fill="currentColor" opacity=".18" />
      <path d="M76 300Q132 163 214 95M130 205Q54 204 52 145Q109 143 130 205M164 155Q224 153 250 99Q190 91 164 155" fill="currentColor" opacity=".65" />
      <g data-season-detail="bloom" fill={gold} transform="translate(105 112)"><ellipse rx="20" ry="44"/><ellipse rx="20" ry="44" transform="rotate(60)"/><ellipse rx="20" ry="44" transform="rotate(120)"/><circle r="15" fill={paper}/></g>
      <g fill="currentColor" transform="translate(225 217) rotate(15)"><ellipse rx="13" ry="29"/><ellipse rx="13" ry="29" transform="rotate(60)"/><ellipse rx="13" ry="29" transform="rotate(120)"/><circle r="9" fill={paper}/></g>
      <path d="M26 240Q140 270 275 241" fill="none" stroke="currentColor" opacity=".3"/>
    </>; break;
    case 'summer': art = <>
      <circle cx="160" cy="118" r="88" fill="currentColor" opacity=".13"/>
      <circle data-season-detail="sunlight" cx="160" cy="118" r="61" fill={gold}/>
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M160 13V34M160 202V222M55 118H76M244 118H265M86 44L101 60M220 178L235 194M86 194L101 178M220 60L235 44"/></g>
      <path d="M0 210Q85 152 179 213T300 196V300H0Z" fill="currentColor" opacity=".3"/>
      <path d="M0 246Q67 195 164 239T300 218V300H0Z" fill={paper}/>
      <path d="M0 275Q106 234 206 272T300 255" fill="none" stroke="currentColor" strokeWidth="2" opacity=".6"/>
    </>; break;
    case 'autumn': art = <>
      <circle cx="151" cy="151" r="112" fill="currentColor" opacity=".1"/>
      <path d="M45 300Q136 165 228 27" fill="none" stroke={gold} strokeWidth="5"/>
      <path d="M112 207Q28 184 42 111Q109 123 112 207M158 140Q162 47 231 35Q253 112 158 140M77 252Q13 252 8 199Q65 191 77 252" fill="currentColor" opacity=".8"/>
      <path data-season-detail="copper" d="M130 187Q207 182 242 128Q161 121 130 187M181 102Q149 63 164 12Q206 41 181 102" fill={gold}/>
      <path d="M44 113L111 205M231 36L158 139M241 129L132 186" fill="none" stroke={paper} strokeWidth="2" opacity=".65"/>
    </>; break;
    case 'new-year': art = <>
      <circle cx="150" cy="152" r="108" fill="none" stroke="currentColor" opacity=".2"/>
      <path data-season-detail="spark" d="M150 40L168 112L240 130L168 149L150 222L132 149L59 130L132 112Z" fill={gold}/>
      <path d="M229 194L238 222L266 231L238 240L229 268L220 240L192 231L220 222Z" fill="currentColor"/>
      <path d="M51 44L60 68L84 77L60 86L51 110L42 86L18 77L42 68Z" fill="currentColor" opacity=".65"/>
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M39 224Q18 199 43 179M218 35Q247 24 257 48M99 250L107 275M260 131L280 124"/></g>
      <circle cx="119" cy="34" r="4" fill={paper}/><circle cx="167" cy="266" r="5" fill={gold}/>
    </>; break;
    case 'ramadan': art = <>
      <path d="M35 300V150Q35 74 150 18Q265 74 265 150V300Z" fill="currentColor" opacity=".1"/>
      <path d="M56 300V152Q56 93 150 44Q244 93 244 152V300" fill="none" stroke="currentColor" opacity=".35" strokeWidth="2"/>
      <path d="M170 65A70 70 0 1 0 222 176A63 63 0 0 1 170 65Z" fill={gold}/>
      <path d="M218 0V62M76 0V108" stroke="currentColor" strokeWidth="2"/>
      <g data-season-detail="lanterns" fill="currentColor"><path d="M205 72L218 58L231 72L242 125L218 146L194 125Z"/><path d="M66 119L76 107L86 119L94 160L76 176L58 160Z"/></g>
      <path d="M210 84H226V120H210Z M70 130H82V157H70Z" fill={paper}/>
      <path d="M105 66L109 77L120 81L109 85L105 96L101 85L90 81L101 77Z" fill={gold}/>
    </>; break;
    case 'eid': art = <>
      <circle cx="152" cy="159" r="108" fill="currentColor" opacity=".12"/>
      <g transform="rotate(-8 150 170)"><path d="M60 133H240V265H60Z" fill="currentColor" opacity=".65"/><path d="M46 113H254V153H46Z" fill="currentColor"/><path d="M136 114H164V265H136Z" fill={gold}/><path data-season-detail="ribbon" d="M150 113Q59 113 81 68Q108 27 150 113Q191 27 219 68Q242 113 150 113" fill="none" stroke={gold} strokeWidth="13" strokeLinecap="round"/></g>
      <path d="M52 34L58 50L74 56L58 62L52 78L46 62L30 56L46 50ZM250 58L254 69L265 73L254 77L250 88L246 77L235 73L246 69Z" fill={gold}/>
    </>; break;
    case 'holiday': art = <>
      <path d="M56 300V143A96 96 0 0 1 248 143V300Z" fill="currentColor" opacity=".15"/>
      <circle cx="176" cy="106" r="42" fill={gold}/>
      <path d="M0 192Q41 153 93 192T195 192T300 192V300H0Z" fill="currentColor" opacity=".45"/>
      <path d="M0 229Q49 191 98 229T196 229T300 229V300H0Z" fill={paper}/>
      <path data-season-detail="tide" d="M0 262Q49 224 98 262T196 262T300 262" fill="none" stroke="currentColor" strokeWidth="3"/>
      <path d="M62 90Q77 76 92 90Q107 76 122 90" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </>; break;
    case 'school': art = <>
      <g transform="rotate(-10 145 155)"><rect x="48" y="53" width="166" height="220" rx="12" fill="currentColor" opacity=".23"/><rect x="63" y="37" width="166" height="220" rx="12" fill={paper}/><path d="M86 37V257" stroke="currentColor" opacity=".45" strokeWidth="3"/><path data-season-detail="rules" d="M107 95H202M107 122H202M107 149H189M107 176H197M107 203H166" stroke="currentColor" strokeWidth="3" opacity=".55"/><path d="M163 37H193V88L178 77L163 88Z" fill={gold}/></g>
      <g transform="rotate(20 239 174)"><path d="M230 81H247V238L239 261L230 238Z" fill="currentColor"/><path d="M230 238H247L239 261Z" fill={gold}/></g>
    </>; break;
    case 'weekend': art = <>
      <g transform="rotate(-12 150 155)"><path d="M26 76H274V129A23 23 0 0 0 274 175V228H26V175A23 23 0 0 0 26 129Z" fill="currentColor" opacity=".2"/><path d="M42 91H258V129A23 23 0 0 0 258 175V213H42V175A23 23 0 0 0 42 129Z" fill={paper}/><path d="M210 94V211" stroke="currentColor" strokeWidth="2" strokeDasharray="5 7"/><g data-season-detail="ticket-ink" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round"><circle cx="102" cy="125" r="13"/><circle cx="153" cy="178" r="13"/><path d="M100 185L157 118"/></g></g>
      <path d="M68 30L75 46L91 53L75 60L68 76L61 60L45 53L61 46Z" fill={gold}/>
    </>; break;
    case 'black-friday': art = <>
      <g transform="rotate(-13 150 150)"><rect x="29" y="33" width="244" height="244" rx="32" fill="currentColor" opacity=".14"/><rect x="43" y="47" width="216" height="216" rx="23" fill="currentColor"/><path d="M57 65H245M57 245H245" stroke={paper} strokeWidth="1" opacity=".25"/><g fill="none" stroke={paper} strokeWidth="16" strokeLinecap="round"><circle cx="111" cy="111" r="23"/><circle cx="190" cy="192" r="23"/><path d="M102 209L198 92"/></g><path data-season-detail="foil" d="M227 46H259V78Z" fill={gold}/></g>
    </>; break;
    case 'season-end': art = <>
      <g transform="rotate(-20 150 150)"><path d="M78 54H204V196L141 253L78 196Z" fill="currentColor" opacity=".2"/><path d="M100 38H226V180L163 237L100 180Z" fill="currentColor"/><circle cx="163" cy="68" r="10" fill={paper}/><path data-season-detail="thread" d="M163 58Q87 -2 69 45Q61 77 103 83" fill="none" stroke={gold} strokeWidth="4"/><path d="M130 113H196M130 133H196M146 160H179" stroke={paper} strokeWidth="3"/></g>
      <path d="M39 234H94M45 249H79M218 245H267" stroke={gold} strokeWidth="3" strokeLinecap="round"/>
    </>; break;
    default: return null;
  }
  return <svg viewBox="0 0 300 300" fill="none" aria-hidden="true" focusable="false" data-season-illustration={scene}>{art}</svg>;
}

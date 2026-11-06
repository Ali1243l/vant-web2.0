import type { HeroScene } from '../lib/heroAppearance';

/** Filled campaign artwork, for the banner and editable campaign previews. */
export default function SeasonalIllustration({ scene }: { scene: HeroScene }) {
  const paper = 'var(--season-paper, #fffaf0)';
  const gold = 'var(--season-highlight, #dba85c)';
  let art;
  switch (scene) {
    case 'winter': art = <>
      <circle cx="154" cy="141" r="101" fill="currentColor" opacity=".05"/>
      <circle cx="154" cy="141" r="101" fill="none" stroke="currentColor" strokeWidth="1" opacity=".2" strokeDasharray="2 9"/>
      <g data-season-detail="frost" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        {[0, 60, 120, 180, 240, 300].map(angle => <path key={angle} transform={`rotate(${angle} 154 141)`} d="M154 141V47M154 75L135 57M154 75L173 57M154 105L127 80M154 105L181 80"/>)}
      </g>
      <path d="M154 122L171 132V151L154 161L137 151V132Z" fill={paper} stroke="currentColor" strokeWidth="1.5"/>
      <path d="M37 278Q158 258 249 210M81 267L65 247M116 258L98 230M151 245L137 222M184 233L176 211M115 258L114 281M151 245L156 270M184 233L196 254" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      <g fill={paper}><circle cx="39" cy="157" r="3"/><circle cx="258" cy="106" r="3"/><circle cx="244" cy="254" r="4"/></g>
    </>; break;
    case 'spring': art = <>
      <path d="M40 281Q44 96 215 30Q272 190 40 281Z" fill="currentColor" opacity=".08"/>
      <path d="M66 288Q127 210 111 92M81 279Q188 235 213 154M93 264Q121 164 183 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <path d="M104 224Q36 201 52 152Q112 165 104 224M142 207Q199 209 224 178Q174 164 142 207M157 127Q130 77 164 48Q191 84 157 127M87 266Q44 253 27 219Q81 215 87 266" fill="currentColor" opacity=".65"/>
      <g data-season-detail="bloom" fill={gold} transform="translate(108 92)"><ellipse rx="18" ry="37"/><ellipse rx="18" ry="37" transform="rotate(60)"/><ellipse rx="18" ry="37" transform="rotate(120)"/><circle r="12" fill={paper}/></g>
      <g fill={paper} stroke="currentColor" strokeWidth="1" transform="translate(213 151)"><ellipse rx="13" ry="27"/><ellipse rx="13" ry="27" transform="rotate(60)"/><ellipse rx="13" ry="27" transform="rotate(120)"/><circle r="8" fill={gold} stroke="none"/></g>
      <path d="M172 59Q170 34 187 34Q205 38 193 59Q182 73 172 59Z" fill={gold}/>
      <path d="M58 164L103 219M171 191L199 188M148 91L158 118" stroke={paper} strokeWidth="1.5" opacity=".65"/>
      <path d="M53 282Q119 298 180 266" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" opacity=".55"/>
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
      <rect x="23" y="24" width="254" height="248" rx="70" fill="currentColor" opacity=".08"/>
      <circle cx="215" cy="79" r="30" fill={gold}/>
      <path d="M35 155Q81 126 124 151T260 143M35 171Q81 142 124 167T260 159" fill="none" stroke="currentColor" strokeWidth="2" opacity=".4"/>
      <path d="M90 131V91Q90 77 104 77H131Q145 77 145 91V131M99 129V94H136V129" fill="none" stroke="currentColor" strokeWidth="4"/>
      <rect x="57" y="121" width="146" height="145" rx="23" fill="currentColor"/>
      <rect x="66" y="130" width="128" height="126" rx="17" fill={paper} opacity=".65"/>
      <path d="M89 139V246M113 139V246M137 139V246M161 139V246" stroke="currentColor" strokeWidth="2" opacity=".4"/>
      <path d="M83 265V278M178 265V278" stroke="currentColor" strokeWidth="9" strokeLinecap="round"/>
      <path d="M179 152L220 166L213 197L176 184Z" fill={gold}/>
      <path data-season-detail="tide" d="M212 106Q255 111 262 84Q267 61 243 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 6" opacity=".65"/>
      <path d="M235 39L267 44L243 66L246 49Z" fill={paper} stroke="currentColor" strokeWidth="1.2"/>
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
      <path d="M60 100L207 83L249 255L94 279Z" fill="currentColor" opacity=".1"/>
      <path d="M82 100L217 100L237 264H62Z" fill={paper} stroke="currentColor" strokeWidth="2"/>
      <path d="M217 100L245 118L263 250L237 264Z" fill="currentColor" opacity=".35"/>
      <path d="M111 111V72Q111 34 150 34Q189 34 189 72V111" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
      <path d="M119 107V73Q119 43 150 43Q181 43 181 73V107" fill="none" stroke={gold} strokeWidth="1.5" opacity=".7"/>
      <path data-season-detail="foil" d="M110 158L150 223L191 158" fill="none" stroke={gold} strokeWidth="9" strokeLinecap="round"/>
      <path d="M87 248H211M90 121H208" stroke="currentColor" strokeWidth="1" opacity=".3"/>
      <path d="M211 94L239 119L224 146L201 121Z" fill={gold}/>
      <circle cx="215" cy="107" r="3" fill={paper}/>
    </>; break;
    case 'season-end': art = <>
      <g transform="rotate(-20 150 150)"><path d="M78 54H204V196L141 253L78 196Z" fill="currentColor" opacity=".2"/><path d="M100 38H226V180L163 237L100 180Z" fill="currentColor"/><circle cx="163" cy="68" r="10" fill={paper}/><path data-season-detail="thread" d="M163 58Q87 -2 69 45Q61 77 103 83" fill="none" stroke={gold} strokeWidth="4"/><path d="M130 113H196M130 133H196M146 160H179" stroke={paper} strokeWidth="3"/><path d="M111 93V176L163 223L215 176V50" fill="none" stroke={paper} strokeWidth="1.5" opacity=".35"/><circle cx="163" cy="68" r="15" fill="none" stroke={gold} strokeWidth="1.5" opacity=".6"/></g>
      <path d="M39 234H94M45 249H79M218 245H267" stroke={gold} strokeWidth="3" strokeLinecap="round"/>
    </>; break;
    default: return null;
  }
  return <svg viewBox="0 0 300 300" fill="none" aria-hidden="true" focusable="false" data-season-illustration={scene}>{art}</svg>;
}

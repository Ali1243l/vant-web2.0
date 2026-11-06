import type { HeroScene } from '../lib/heroAppearance';

/** Margin-only scenery; product photography and shopping controls stay unobstructed. */
export default function SeasonalBackdrop({ scene }: { scene: HeroScene }) {
  const accent = 'var(--season-secondary, #d6b67c)';
  let art;
  switch (scene) {
    case 'winter': art = <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 500Q139 361 151 80M74 416L38 337M104 348L55 273M127 267L88 204M141 191L112 134M72 418L157 401M104 349L196 322M127 269L209 238M142 191L209 162"/>
      <path d="M224 42V112M193 59L255 95M193 95L255 59M214 49L224 61L234 49M214 105L224 93L234 105"/>
      <circle cx="242" cy="378" r="4"/><circle cx="185" cy="472" r="3"/>
    </g>; break;
    case 'spring': art = <>
      <path d="M8 574Q129 386 142 80M59 488Q183 373 235 242M103 370Q30 286 59 198" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M68 462Q9 425 20 370Q81 388 68 462M106 359Q162 330 178 269Q111 278 106 359M137 218Q67 181 82 123Q145 143 137 218M176 325Q251 325 265 280Q201 266 176 325" fill="currentColor" opacity=".35"/>
      <g data-backdrop-detail="bloom" fill={accent}><path d="M139 57Q110 16 97 48Q74 62 112 81Q86 117 119 119Q147 146 153 103Q197 115 187 84Q193 49 155 62Q150 18 139 57Z"/><path d="M235 217Q214 193 208 219Q188 235 216 244Q203 270 229 266Q253 282 252 252Q283 255 269 233Q274 209 249 221Z"/></g>
      <g fill="currentColor"><circle cx="141" cy="86" r="9"/><circle cx="237" cy="239" r="6"/></g>
    </>; break;
    case 'summer': art = <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="35" cy="142" r="88"/><circle cx="35" cy="142" r="105"/>
      <path d="M35 19V2M130 47L146 31M158 142H181M130 237L146 253M35 265V288M5 420L237 352M15 440L246 371M25 460L254 390M35 480L262 409"/>
      <path d="M85 387L115 472M111 378L141 464M138 371L167 455M165 363L193 447" stroke={accent}/>
    </g>; break;
    case 'autumn': art = <>
      <path d="M2 554Q128 410 192 71M78 440L43 327M125 310L84 207M158 201L239 143" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M43 327Q-5 292 23 248Q65 271 43 327M84 207Q24 171 56 118Q111 145 84 207M125 310Q203 298 221 244Q143 237 125 310M192 78Q157 24 200 4Q232 39 192 78" fill="currentColor" opacity=".35"/>
      <path data-backdrop-detail="leaf" d="M174 424Q240 381 266 426Q217 466 174 424Z" fill={accent}/>
    </>; break;
    case 'new-year': art = <>
      <g fill="none" stroke={accent} strokeWidth="1.3"><path d="M-28 458A220 220 0 0 0 169 49M-32 480A243 243 0 0 0 189 27"/><circle cx="180" cy="164" r="7"/><circle cx="75" cy="423" r="5"/></g>
      <path data-backdrop-detail="star" d="M208 240L219 278L258 290L219 302L208 340L197 302L158 290L197 278Z" fill={accent}/>
      <path d="M79 50L85 69L104 75L85 81L79 100L73 81L54 75L73 69ZM180 468L185 484L201 489L185 494L180 510L175 494L159 489L175 484Z" fill="currentColor"/>
    </>; break;
    case 'ramadan': art = <>
      <path d="M27 0V421M176 0V164M13 74Q83 125 238 72" fill="none" stroke="currentColor" strokeWidth="1.4"/>
      <g data-backdrop-detail="lantern" fill="none" stroke={accent} strokeWidth="2"><path d="M156 177L176 159L196 177L207 243L176 268L145 243ZM165 191H187V236H165ZM176 191V236M152 247H200"/></g>
      <path d="M12 433L27 418L42 433L52 480L27 500L2 480Z" fill="currentColor" opacity=".3"/>
      <path d="M100 97L105 112L120 117L105 122L100 137L95 122L80 117L95 112Z M227 402L232 417L247 422L232 427L227 442L222 427L207 422L222 417Z" fill={accent}/>
    </>; break;
    case 'eid': art = <>
      <path d="M-20 84Q141 197 310 55" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 113L34 160L58 129M104 143L124 190L145 142M187 124L218 164L229 108" fill={accent} opacity=".65"/>
      <path d="M27 550Q188 449 229 287M27 550Q126 429 141 368" fill="none" stroke={accent} strokeWidth="3"/>
      <path d="M194 271Q163 221 141 253Q122 280 175 293Q145 340 182 341Q220 336 211 297Q263 317 268 282Q264 253 222 279Z" fill="none" stroke="currentColor" strokeWidth="2"/>
      <g fill="currentColor"><circle cx="87" cy="277" r="3"/><circle cx="235" cy="458" r="4"/></g>
    </>; break;
    case 'holiday': art = <>
      <path d="M11 564Q78 409 99 192" fill="none" stroke="currentColor" strokeWidth="3"/>
      <path d="M99 192Q28 105 1 164Q61 165 99 192M99 192Q83 92 144 83Q122 139 99 192M99 192Q178 91 232 140Q160 159 99 192M99 192Q217 166 234 239Q168 204 99 192" fill="currentColor" opacity=".35"/>
      <path d="M-12 429Q46 397 100 429T212 429M-12 455Q46 423 100 455T212 455" fill="none" stroke={accent} strokeWidth="1.5"/>
      <circle cx="203" cy="339" r="32" fill={accent} opacity=".55"/>
    </>; break;
    case 'school': art = <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M52 31H223V288H52ZM76 31V288M95 84H202M95 111H202M95 138H202M95 165H202M95 192H187M95 219H170"/>
      <path d="M42 64H66M42 99H66M42 134H66M42 169H66M42 204H66M42 239H66" stroke={accent} strokeWidth="3"/>
      <path d="M58 474L188 344L207 363L77 493L49 502Z M174 358L193 377M59 474L77 493"/>
      <path d="M223 441H256V554H223ZM239 454H256M239 471H256M239 488H256M239 505H256M239 522H256" stroke={accent}/>
    </g>; break;
    case 'weekend': art = <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M-14 89H213V128Q180 147 213 166V210H-14M182 92V209" strokeDasharray="4 7"/>
      <path d="M38 116L68 175L99 116M125 119H159M125 137H151M125 155H159M125 173H144"/>
      <path d="M47 386L228 341L239 384Q210 408 249 427L261 471L80 516M201 350L235 478" stroke={accent}/>
      <circle cx="118" cy="430" r="22" stroke={accent}/>
    </g>; break;
    case 'black-friday': art = <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M31 35H233M31 46H163M31 259H233M43 35V259M222 35V259"/>
      <path d="M60 119Q97 82 154 111Q212 146 207 203M59 127Q104 92 151 119Q199 146 199 193" stroke={accent}/>
      <path d="M-12 428L231 366M-8 440L235 378M-4 452L239 390" stroke={accent}/>
      <circle cx="188" cy="492" r="25"/><path d="M175 482L188 505L201 482"/>
    </g>; break;
    case 'season-end': art = <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 68H91L111 86H235V246H17ZM17 100H235M41 126H148M41 147H190M41 168H166"/>
      <path d="M73 374L198 339L235 469L174 529L100 507Z M134 357Q88 296 66 330Q52 361 105 382" stroke={accent}/>
      <circle cx="137" cy="380" r="9" stroke={accent}/><path d="M124 423L195 405M131 444L190 429"/>
    </g>; break;
    default: return null;
  }
  return <svg className="store-season-scenery" data-season-backdrop={scene} viewBox="0 0 300 600" fill="none" aria-hidden="true" focusable="false">{art}</svg>;
}

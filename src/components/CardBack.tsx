export default function CardBack() {
  return <svg className="celestial-back" viewBox="0 0 200 300" fill="none" aria-hidden="true" focusable="false">
    <rect x="2" y="2" width="196" height="296" rx="13" fill="#101827" stroke="#ece2c7" strokeWidth="4" />
    <rect x="12" y="12" width="176" height="276" rx="7" stroke="#bca76c" strokeWidth=".8" />
    <rect x="19" y="19" width="162" height="262" rx="3" stroke="#8e966f" strokeWidth=".5" />
    <path d="M100 34 160 150 100 266 40 150 100 34Z" stroke="#768b72" strokeWidth=".7" />
    <path d="M100 57 145 150 100 243 55 150 100 57Z" stroke="#768b72" strokeWidth=".5" />
    <circle cx="100" cy="150" r="47" stroke="#c6b477" strokeWidth=".9" />
    <circle cx="100" cy="150" r="37" stroke="#768b72" strokeWidth=".6" />
    <path d="M100 119 107 141 129 150 107 159 100 181 93 159 71 150 93 141 100 119Z" fill="#f07b5a" />
    <circle cx="100" cy="150" r="6" fill="#101827" stroke="#d8c28d" />
    <path d="M101 55a13 13 0 1 0 0 26 10 10 0 0 1 0-26Z" fill="#d8c28d" />
    <circle cx="100" cy="232" r="8" stroke="#d8c28d" />
    <path d="M100 217v-5m0 40v-5m15-15h5m-40 0h5m4-11-4-4m26 26 4 4m-26-4-4 4m26-26 4-4" stroke="#d8c28d" />
    <path d="M29 54v37m0-26 8-8m-8 20 8-8m-8 20 8-8M171 246v-37m0 26-8 8m8-20-8 8m8-20-8 8" stroke="#bca76c" strokeWidth=".8" />
    <path d="m31 246 5 5-5 5-5-5 5-5Zm138-202 5 5-5 5-5-5 5-5Z" fill="#d8c28d" />
    {[ [49,53],[153,248],[31,124],[169,176],[54,204],[146,96],[61,29],[140,272] ].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="1.5" fill="#d8c28d" />)}
  </svg>;
}

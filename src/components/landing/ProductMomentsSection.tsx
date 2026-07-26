import { PlanToLiveGuidance } from './PlanToLiveGuidance';

type ProductScreen = 'home' | 'live' | 'rest' | 'progress';

const lanes: readonly { screen: ProductScreen; className: string }[] = [
  { screen: 'home', className: 'is-home is-down' },
  { screen: 'live', className: 'is-live is-up' },
  { screen: 'rest', className: 'is-rest is-down' },
  { screen: 'progress', className: 'is-progress is-up' },
];

export function ProductMomentsSection() {
  const showProductRiver = false;

  return (
    <>
      <PlanToLiveGuidance />
      {showProductRiver && <section className="d3-product-river" aria-labelledby="product-river-title">
      <p className="d3-river-kicker">APP EXPERIENCE / CONTINUOUS COACHING LOOP</p>
      <h2 id="product-river-title">A RIVER OF<br />REAL PRODUCT<br />MOMENTS.</h2>
      <div className="d3-river-intro"><p>Plan. Train. Rest. Progress. The interface keeps moving because the coaching relationship does too.</p><small>SLOW VERTICAL MARQUEE / ALTERNATING DIRECTION</small></div>
      <div className="d3-river-rule" aria-hidden="true" />
      <div className="d3-river-viewport" aria-label="Delirio app screens moving through a continuous coaching loop">
        <div className="d3-river-guides" aria-hidden="true">{[0, 1, 2, 3].map((item) => <i key={item} />)}</div>
        {lanes.map(({ screen, className }) => (
          <div className={`d3-river-lane ${className}`} key={screen} aria-hidden="true">
            {[0, 1, 2, 3].map((item) => <RiverPhone key={item} screen={screen} />)}
          </div>
        ))}
      </div>
      <div className="d3-river-fade is-top" aria-hidden="true" />
      <div className="d3-river-fade is-bottom" aria-hidden="true" />
      </section>}
    </>
  );
}

function RiverPhone({ screen }: { screen: ProductScreen }) {
  return (
    <div className={`d3-river-phone is-${screen}`}>
      <div className="d3-river-screen">
        <span className="d3-river-time">9:41</span><span className="d3-river-status">••• 100%</span><i className="d3-river-island" />
        {screen === 'home' && <HomeScreen />}
        {screen === 'live' && <LiveScreen />}
        {screen === 'rest' && <RestScreen />}
        {screen === 'progress' && <ProgressScreen />}
      </div>
    </div>
  );
}

function HomeScreen() {
  return <><h3>DELIRIO</h3><small>GOOD MORNING</small><div className="river-coach"><i>R</i><b>REED</b><span>READY TO COACH</span></div><h4>TODAY’S PLAN</h4><div className="river-plan"><b>PUSH</b><span>42 MIN / 6 MOVES</span></div><div className="river-plan"><b>RUNNING</b><span>RECOVERY / 20 MIN</span></div><footer>HOME&nbsp;&nbsp;&nbsp;&nbsp; TRAIN&nbsp;&nbsp;&nbsp;&nbsp; PROGRESS</footer></>;
}

function LiveScreen() {
  return <><small>LIVE COACH</small><h3>BACK SQUAT <em>REP 08</em></h3><div className="river-camera"><span>LIVE CAMERA<br />+ POSE TRACKING</span><svg viewBox="0 0 160 230" aria-hidden="true"><g stroke="#b8d65c" strokeWidth="3" fill="#b8d65c"><path d="M80 20 55 65 45 120M80 20l25 45 10 55M55 65l25 55 25-55M80 120l-22 62-10 42M80 120l22 62 10 42" fill="none" />{[[80,20],[55,65],[105,65],[45,120],[115,120],[80,120],[58,182],[102,182],[48,224],[112,224]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="4" />)}</g></svg></div><div className="river-form">FORM 87%&nbsp;&nbsp;&nbsp;&nbsp; DEPTH GOOD</div></>;
}

function RestScreen() {
  return <><small>BETWEEN SETS</small><h3>REST</h3><strong className="river-timer">00:56</strong><h4>SET HISTORY</h4>{['SET 01   8 REPS   87%','SET 02   8 REPS   90%','SET 03   READY'].map(item=><div className="river-set" key={item}>{item}</div>)}<button type="button" tabIndex={-1}>CONTINUE WHEN READY</button><footer>MANUAL CONTINUATION</footer></>;
}

function ProgressScreen() {
  return <><small>PROGRESS</small><h3>ROMANIAN<br />DEADLIFT</h3><div className="river-metrics"><p><b>225 LB</b><span>TOP SET</span></p><p><b>4,280</b><span>TOTAL VOLUME</span></p></div><div className="river-chart"><small>12-WEEK TREND</small><svg viewBox="0 0 170 150" aria-hidden="true"><path d="M12 132H160M12 132V20" stroke="#8a877d" /><polyline points="18,118 45,98 72,105 98,70 125,52 155,25" fill="none" stroke="#0e0e0d" strokeWidth="3" />{[[18,118],[45,98],[72,105],[98,70],[125,52],[155,25]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill="#b8d65c" stroke="#0e0e0d" />)}</svg></div><footer>WEIGHT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; VOLUME</footer></>;
}

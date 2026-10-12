import { useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, CalendarDays,
  ChevronDown, CircleHelp, Command, Download, Ellipsis, LayoutDashboard,
  Lightbulb, Menu, Package, Search, Settings2, ShoppingBag, SlidersHorizontal,
  Sparkles, Target, TrendingUp, Users, X
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart,
  Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const salesByMonth = [
  { month: 'Jan', sales: 31800, profit: 8200 },
  { month: 'Feb', sales: 36200, profit: 9600 },
  { month: 'Mar', sales: 33700, profit: 8900 },
  { month: 'Apr', sales: 42100, profit: 11300 },
  { month: 'May', sales: 39700, profit: 10800 },
  { month: 'Jun', sales: 48600, profit: 13700 },
  { month: 'Jul', sales: 45300, profit: 12600 },
  { month: 'Aug', sales: 52700, profit: 15100 },
  { month: 'Sep', sales: 49800, profit: 14200 },
  { month: 'Oct', sales: 58400, profit: 16800 },
  { month: 'Nov', sales: 63100, profit: 18400 },
  { month: 'Dec', sales: 71900, profit: 21300 },
]
const regionRows = [
  { region: 'West', sales: 238400, share: 34, color: '#6d7df5' },
  { region: 'East', sales: 194200, share: 28, color: '#34b8a2' },
  { region: 'Central', sales: 158600, share: 23, color: '#f2b65d' },
  { region: 'South', sales: 108700, share: 15, color: '#f28f9b' },
]
const products = [
  { name: 'Wireless Headphones', sku: 'TEC-2048', category: 'Technology', sold: 1240, revenue: 84200, change: 18.6, color: '#6d7df5' },
  { name: 'Ergonomic Office Chair', sku: 'FUR-1032', category: 'Furniture', sold: 986, revenue: 68150, change: 12.4, color: '#34b8a2' },
  { name: 'Smart Monitor 27"', sku: 'TEC-1881', category: 'Technology', sold: 754, revenue: 54700, change: 8.2, color: '#f2b65d' },
  { name: 'Premium Notebook Set', sku: 'OFF-2044', category: 'Office Supplies', sold: 2180, revenue: 32800, change: -2.4, color: '#f28f9b' },
]
const categories = [
  { name: 'Technology', value: 42, color: '#6d7df5' },
  { name: 'Furniture', value: 31, color: '#34b8a2' },
  { name: 'Office supplies', value: 18, color: '#f2b65d' },
  { name: 'Other', value: 9, color: '#dce3ee' },
]
const formatMoney = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
const shortMoney = (value) => value >= 1000 ? '$' + (value / 1000).toFixed(value >= 10000 ? 0 : 1) + 'k' : '$' + value

function StatCard({ icon: Icon, label, value, change, tone, note }) {
  const positive = !String(change).startsWith('-')
  return <article className="stat-card">
    <div className="stat-top">
      <span className={`stat-icon ${tone}`}><Icon size={18} /></span>
      <button className="icon-button subtle" aria-label={label + ' options'}><Ellipsis size={18} /></button>
    </div>
    <p className="stat-label">{label}</p>
    <div className="stat-value">{value}</div>
    <div className="stat-foot">
      <span className={`change-pill ${positive ? 'positive' : 'negative'}`}>
        {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{change}
      </span>
      <span className="stat-note">{note}</span>
    </div>
  </article>
}

function App() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [period, setPeriod] = useState('This year')
  const [region, setRegion] = useState('All regions')
  const [category, setCategory] = useState('All categories')
  const [query, setQuery] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notice, setNotice] = useState(false)

  const chartData = useMemo(() => {
    const count = period === 'Last 30 days' ? 2 : period === 'Last 90 days' ? 3 : period === 'This quarter' ? 3 : 12
    return salesByMonth.slice(-count)
  }, [period])
  const filteredProducts = products.filter(p =>
    (category === 'All categories' || p.category === category) &&
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
  )
  const totalSales = chartData.reduce((sum, d) => sum + d.sales, 0)
  const totalProfit = chartData.reduce((sum, d) => sum + d.profit, 0)
  const visibleRegions = regionRows.filter(r => region === 'All regions' || r.region === region)

  function downloadReport() {
    const rows = [['Month', 'Sales', 'Profit'], ...chartData.map(d => [d.month, d.sales, d.profit])]
    const csv = rows.map(row => row.join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    link.download = 'sales-performance-report.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const navGroups = [
    { title: 'WORKSPACE', items: [
      { label: 'Overview', icon: LayoutDashboard },
      { label: 'Sales analytics', icon: BarChart3 },
      { label: 'Products', icon: ShoppingBag },
      { label: 'Customers', icon: Users },
    ]},
    { title: 'MANAGE', items: [
      { label: 'Reports', icon: Activity },
      { label: 'Goals & targets', icon: Target },
      { label: 'Settings', icon: Settings2 },
    ]},
  ]

  return <div className="app-shell">
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Command size={21} strokeWidth={2.5} /></div>
        <div><span className="brand-name">metric<span>flow</span></span><span className="brand-caption">BUSINESS INTELLIGENCE</span></div>
        <button className="close-sidebar icon-button" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={19}/></button>
      </div>
      <button className="workspace-switch">
        <div className="workspace-avatar">A</div>
        <div className="workspace-copy"><strong>Acme Studio</strong><span>Free workspace</span></div>
        <ChevronDown size={15} className="workspace-chevron" />
      </button>
      {navGroups.map(group => <div className="nav-group" key={group.title}>
        <p className="nav-heading">{group.title}</p>
        {group.items.map(item => <button key={item.label} onClick={() => { setActiveNav(item.label); setMobileOpen(false) }} className={`nav-item ${activeNav === item.label ? 'active' : ''}`}>
          <item.icon size={18} strokeWidth={1.8}/><span>{item.label}</span>
          {item.label === 'Reports' && <span className="nav-count">4</span>}
        </button>)}
      </div>)}
      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <div className="upgrade-icon"><Sparkles size={17}/></div>
          <strong>Make better decisions</strong>
          <p>Unlock deeper insights with advanced analytics.</p>
          <button onClick={() => setNotice(true)}>Explore Pro <ArrowUpRight size={14}/></button>
        </div>
        <button className="profile-row">
          <div className="profile-avatar">PS</div>
          <div className="profile-copy"><strong>Praveen S.</strong><span>Admin account</span></div>
          <Ellipsis size={17} className="profile-more"/>
        </button>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="breadcrumb"><button className="mobile-menu icon-button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20}/></button><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeNav}</strong></div>
        <div className="top-actions">
          <label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..." /><kbd>⌘ K</kbd></label>
          <button className="icon-button notification-button" onClick={() => setNotice(!notice)} aria-label="Notifications"><Bell size={18}/><i /></button>
          <span className="top-divider" />
          <button className="help-button"><CircleHelp size={17}/> <span>Help center</span></button>
        </div>
      </header>

      {notice && <div className="notice-banner"><Lightbulb size={17}/><span>This is a frontend demo. Connect your own sales data to make the dashboard production-ready.</span><button onClick={() => setNotice(false)} aria-label="Dismiss notice"><X size={16}/></button></div>}

      <div className="page-content">
        <div className="page-heading">
          <div><div className="eyebrow"><span className="live-dot"/> BUSINESS OVERVIEW</div><h1>{activeNav === 'Overview' ? 'Sales overview' : activeNav}</h1><p>Here’s what’s happening with your business today.</p></div>
          <div className="heading-actions">
            <div className="select-wrap"><CalendarDays size={16}/><select value={period} onChange={e => setPeriod(e.target.value)} aria-label="Date range"><option>This year</option><option>This quarter</option><option>Last 90 days</option><option>Last 30 days</option></select><ChevronDown size={14}/></div>
            <button className="primary-button" onClick={downloadReport}><Download size={16}/> Export report</button>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-caption"><SlidersHorizontal size={15}/> Filters</div>
          <div className="select-wrap filter-select"><select value={region} onChange={e => setRegion(e.target.value)} aria-label="Filter by region"><option>All regions</option><option>West</option><option>East</option><option>Central</option><option>South</option></select><ChevronDown size={14}/></div>
          <div className="select-wrap filter-select"><select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category"><option>All categories</option><option>Technology</option><option>Furniture</option><option>Office Supplies</option></select><ChevronDown size={14}/></div>
          <span className="filter-result">Showing demo data <span>·</span> Updated just now</span>
          <button className="reset-button" onClick={() => {setRegion('All regions');setCategory('All categories');setPeriod('This year');setQuery('')}}>Reset filters</button>
        </div>

        <section className="stats-grid">
          <StatCard icon={TrendingUp} label="Total revenue" value={formatMoney(totalSales)} change="+12.8%" note="vs. previous period" tone="purple" />
          <StatCard icon={Target} label="Net profit" value={formatMoney(totalProfit)} change="+8.4%" note="vs. previous period" tone="green" />
          <StatCard icon={ShoppingBag} label="Orders processed" value="8,549" change="+6.2%" note="vs. previous period" tone="orange" />
          <StatCard icon={Users} label="Active customers" value="2,420" change="-1.6%" note="vs. previous period" tone="pink" />
        </section>

        <section className="primary-grid">
          <article className="panel revenue-panel">
            <div className="panel-heading"><div><h2>Revenue overview</h2><p>Revenue and net profit over time</p></div><button className="more-button" aria-label="Revenue chart options"><Ellipsis size={19}/></button></div>
            <div className="chart-legend"><span><i className="legend-dot revenue-dot"/>Revenue</span><span><i className="legend-dot profit-dot"/>Net profit</span><span className="legend-period">Last 12 months <ChevronDown size={13}/></span></div>
            <div className="revenue-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 8, left: -13, bottom: 0 }}>
              <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7779f7" stopOpacity={0.19}/><stop offset="95%" stopColor="#7779f7" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid stroke="#edf0f6" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8c95a7', fontSize: 11 }} dy={10}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c95a7', fontSize: 11 }} tickFormatter={shortMoney} width={48}/>
              <Tooltip formatter={(v) => formatMoney(v)} contentStyle={{ border: '1px solid #edf0f6', borderRadius: 12, boxShadow: '0 8px 24px #15223b12' }}/>
              <Area type="monotone" dataKey="sales" name="Revenue" stroke="#7779f7" strokeWidth={2.7} fill="url(#revenueFill)" activeDot={{ r: 5, strokeWidth: 0 }}/>
              <Line type="monotone" dataKey="profit" name="Net profit" stroke="#36b89f" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }}/>
            </AreaChart></ResponsiveContainer></div>
            <div className="chart-footer"><span><span className="footer-dot purple-dot"/> Revenue is up <strong>12.8%</strong> from last period</span><button onClick={() => setActiveNav('Sales analytics')}>View analytics <ArrowUpRight size={14}/></button></div>
          </article>

          <article className="panel region-panel">
            <div className="panel-heading"><div><h2>Sales by region</h2><p>Revenue distribution</p></div><button className="more-button" aria-label="Region chart options"><Ellipsis size={19}/></button></div>
            <div className="region-chart-wrap"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={regionRows} dataKey="sales" nameKey="region" innerRadius={65} outerRadius={88} paddingAngle={4} stroke="none">{regionRows.map(r => <Cell key={r.region} fill={r.color}/>)}</Pie><Tooltip formatter={(v) => formatMoney(v)}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>$699.9k</strong><span>Total sales</span></div></div></div>
            <div className="region-legend">{regionRows.map(r => <div className="region-row" key={r.region}><span className="region-name"><i style={{background:r.color}}/>{r.region}</span><strong>{r.share}%</strong><span className="region-amount">{shortMoney(r.sales)}</span></div>)}</div>
          </article>
        </section>

        <section className="secondary-grid">
          <article className="panel category-panel">
            <div className="panel-heading"><div><h2>Sales by category</h2><p>Performance across product groups</p></div><button className="more-button" aria-label="Category chart options"><Ellipsis size={19}/></button></div>
            <div className="category-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={categories} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }} barCategoryGap={15}>
              <CartesianGrid stroke="#edf0f6" horizontal={false}/>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#8c95a7', fontSize: 11 }} tickFormatter={v => v + '%'}/>
              <YAxis type="category" dataKey="name" width={112} axisLine={false} tickLine={false} tick={{ fill: '#69758a', fontSize: 11 }}/>
              <Tooltip formatter={v => v + '%'} contentStyle={{ border: '1px solid #edf0f6', borderRadius: 10 }}/>
              <Bar dataKey="value" radius={[0, 5, 5, 0]} barSize={17}>{categories.map(c => <Cell key={c.name} fill={c.color}/>)}</Bar>
            </BarChart></ResponsiveContainer></div>
          </article>
          <article className="panel products-panel">
            <div className="panel-heading"><div><h2>Top performing products</h2><p>Your best sellers this period</p></div><button className="text-link" onClick={() => setActiveNav('Products')}>View all <ArrowUpRight size={14}/></button></div>
            <div className="product-table-wrap"><table className="product-table"><thead><tr><th>PRODUCT</th><th>UNITS SOLD</th><th>REVENUE</th><th>TREND</th></tr></thead><tbody>{filteredProducts.map(p => <tr key={p.sku}><td><div className="product-cell"><span className="product-thumb" style={{background:p.color+'18',color:p.color}}><Package size={17}/></span><span><strong>{p.name}</strong><small>{p.sku}</small></span></div></td><td>{p.sold.toLocaleString()}</td><td className="revenue-cell">{formatMoney(p.revenue)}</td><td><span className={`trend-chip ${p.change > 0 ? 'up' : 'down'}`}>{p.change > 0 ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>} {Math.abs(p.change)}%</span></td></tr>)}</tbody></table>{filteredProducts.length === 0 && <div className="empty-state">No products match your search.</div>}</div>
          </article>
        </section>
        <footer className="page-footer"><span>© 2026 Metricflow Analytics</span><span><i className="footer-status"/> All systems operational</span><span>Made for better decisions <Sparkles size={13}/></span></footer>
      </div>
    </main>
  </div>
}

export default App

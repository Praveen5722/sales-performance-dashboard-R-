import { useMemo, useRef, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, CalendarDays,
  ChevronDown, CircleHelp, Command, Download, FileSpreadsheet, LayoutDashboard,
  Lightbulb, Menu, Package, Search, Settings2, ShoppingBag, SlidersHorizontal,
  Sparkles, Target, TrendingUp, Upload, Users, X, RefreshCw, CheckCircle2
} from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const money = (v) => INR.format(Number(v) || 0)
const shortMoney = (v) => {
  const n = Number(v) || 0
  if (Math.abs(n) >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr'
  if (Math.abs(n) >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L'
  if (Math.abs(n) >= 1000) return '₹' + (n / 1000).toFixed(0) + 'k'
  return '₹' + n.toFixed(0)
}
const COLORS = ['#7779f7', '#34b8a2', '#f2b65d', '#f28f9b', '#72a7f7', '#ae86e8', '#6cc7d7']
const DEMO = [
  { 'Order Date':'2026-01-04', 'Sales':42500, 'Profit':8900, 'Region':'South', 'Category':'Technology', 'Product Name':'Wireless Headphones', 'Quantity':32 },
  { 'Order Date':'2026-01-15', 'Sales':31800, 'Profit':6200, 'Region':'West', 'Category':'Furniture', 'Product Name':'Ergonomic Chair', 'Quantity':18 },
  { 'Order Date':'2026-02-07', 'Sales':51200, 'Profit':12400, 'Region':'East', 'Category':'Technology', 'Product Name':'Smart Monitor', 'Quantity':27 },
  { 'Order Date':'2026-02-18', 'Sales':27600, 'Profit':5100, 'Region':'Central', 'Category':'Office Supplies', 'Product Name':'Notebook Set', 'Quantity':90 },
  { 'Order Date':'2026-03-03', 'Sales':64800, 'Profit':15300, 'Region':'West', 'Category':'Technology', 'Product Name':'Laptop Stand', 'Quantity':42 },
  { 'Order Date':'2026-03-22', 'Sales':38900, 'Profit':7600, 'Region':'South', 'Category':'Furniture', 'Product Name':'Desk Lamp', 'Quantity':35 },
  { 'Order Date':'2026-04-02', 'Sales':58300, 'Profit':14100, 'Region':'East', 'Category':'Technology', 'Product Name':'Wireless Headphones', 'Quantity':44 },
  { 'Order Date':'2026-04-14', 'Sales':46700, 'Profit':9700, 'Region':'Central', 'Category':'Office Supplies', 'Product Name':'Printer Paper', 'Quantity':120 },
  { 'Order Date':'2026-05-09', 'Sales':73500, 'Profit':18600, 'Region':'West', 'Category':'Technology', 'Product Name':'Smart Monitor', 'Quantity':38 },
  { 'Order Date':'2026-05-27', 'Sales':49100, 'Profit':10300, 'Region':'South', 'Category':'Furniture', 'Product Name':'Ergonomic Chair', 'Quantity':25 },
  { 'Order Date':'2026-06-05', 'Sales':68400, 'Profit':17200, 'Region':'East', 'Category':'Technology', 'Product Name':'Laptop Stand', 'Quantity':47 },
  { 'Order Date':'2026-06-21', 'Sales':55200, 'Profit':11900, 'Region':'Central', 'Category':'Office Supplies', 'Product Name':'Notebook Set', 'Quantity':150 },
  { 'Order Date':'2026-07-12', 'Sales':79400, 'Profit':20800, 'Region':'West', 'Category':'Technology', 'Product Name':'Wireless Headphones', 'Quantity':52 },
  { 'Order Date':'2026-08-08', 'Sales':62700, 'Profit':15400, 'Region':'South', 'Category':'Furniture', 'Product Name':'Ergonomic Chair', 'Quantity':36 },
  { 'Order Date':'2026-09-16', 'Sales':85600, 'Profit':22900, 'Region':'East', 'Category':'Technology', 'Product Name':'Smart Monitor', 'Quantity':55 },
  { 'Order Date':'2026-10-01', 'Sales':71800, 'Profit':17100, 'Region':'Central', 'Category':'Office Supplies', 'Product Name':'Printer Paper', 'Quantity':175 },
]
const normalize = (s) => String(s ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
function detectColumn(headers, patterns) {
  return headers.find(h => patterns.some(p => normalize(h).includes(p))) || ''
}
function parseCSV(text) {
  const firstLine = text.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0] || ''
  const delimiters = [',', ';', '\t', '|']
  const delimiter = delimiters.sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0]
  const rows = []
  let row = [], field = '', quoted = false
  const source = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < source.length; i++) {
    const c = source[i], next = source[i + 1]
    if (c === '"' && quoted && next === '"') { field += '"'; i++ }
    else if (c === '"') quoted = !quoted
    else if (c === delimiter && !quoted) { row.push(field.trim()); field = '' }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && next === '\n') i++
      row.push(field.trim())
      if (row.some(v => v !== '')) rows.push(row)
      row = []; field = ''
    } else field += c
  }
  row.push(field.trim())
  if (row.some(v => v !== '')) rows.push(row)
  if (rows.length < 2) throw new Error('This CSV needs a header row and at least one data row.')
  const headers = rows[0].map((h, i) => h || `Column ${i + 1}`)
  return { headers, rows: rows.slice(1).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? '']))) }
}
function asNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const cleaned = String(value ?? '').replace(/[₹$€£,%\s]/g, '').replace(/,/g, '').replace(/[()]/g, m => m === '(' ? '-' : '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}
function asDate(value) {
  if (value === undefined || value === null || value === '') return null
  const s = String(value).trim()
  const d = new Date(s)
  if (!Number.isNaN(d.getTime())) return d
  const match = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (match) {
    const year = Number(match[3].length === 2 ? '20' + match[3] : match[3])
    const d2 = new Date(year, Number(match[1]) - 1, Number(match[2]))
    if (!Number.isNaN(d2.getTime())) return d2
  }
  return null
}
function StatCard({ icon: Icon, label, value, change, tone, note }) {
  return <article className="stat-card"><div className="stat-top"><span className={`stat-icon ${tone}`}><Icon size={18}/></span><span className="stat-mini-icon"><Activity size={15}/></span></div><p className="stat-label">{label}</p><div className="stat-value">{value}</div><div className="stat-foot"><span className={`change-pill ${String(change).startsWith('-') ? 'negative' : 'positive'}`}>{String(change).startsWith('-') ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14}/>} {change}</span><span className="stat-note">{note}</span></div></article>
}
function App() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [rows, setRows] = useState(DEMO)
  const [fileName, setFileName] = useState('Sample sales data')
  const [uploaded, setUploaded] = useState(false)
  const [headers, setHeaders] = useState(Object.keys(DEMO[0]))
  const [mapping, setMapping] = useState({ sales:'Sales', profit:'Profit', date:'Order Date', category:'Category', region:'Region', product:'Product Name', quantity:'Quantity' })
  const [region, setRegion] = useState('All regions')
  const [category, setCategory] = useState('All categories')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) { setNotice('Please choose a .csv file.'); return }
    try {
      const parsed = parseCSV(await file.text())
      const h = parsed.headers
      const nextMapping = {
        sales: detectColumn(h, ['sales','revenue','amount','total','turnover','price']),
        profit: detectColumn(h, ['profit','netincome','marginamount']),
        date: detectColumn(h, ['orderdate','date','invoicedate','transactiondate','createdat']),
        category: detectColumn(h, ['category','productgroup','type']),
        region: detectColumn(h, ['region','state','territory','zone','city']),
        product: detectColumn(h, ['productname','product','item','description','sku']),
        quantity: detectColumn(h, ['quantity','qty','units','unitssold'])
      }
      if (!nextMapping.sales) {
        const numericHeader = h.find(key => parsed.rows.some(r => String(r[key] ?? '').trim() !== '' && Number.isFinite(asNumber(r[key]))))
        if (numericHeader) nextMapping.sales = numericHeader
      }
      setRows(parsed.rows)
      setHeaders(h)
      setMapping(nextMapping)
      setFileName(file.name)
      setUploaded(true)
      setRegion('All regions'); setCategory('All categories'); setQuery('')
      setNotice(`Imported ${parsed.rows.length.toLocaleString()} rows from ${file.name}. Check the column mapping below if any field was not detected correctly.`)
      setActiveNav('Overview')
    } catch (error) { setNotice(error.message || 'Could not read this CSV file.') }
  }

  const mappedRows = useMemo(() => rows.map((r, i) => ({
    raw: r, index: i,
    sales: mapping.sales ? asNumber(r[mapping.sales]) : 0,
    profit: mapping.profit ? asNumber(r[mapping.profit]) : 0,
    date: mapping.date ? asDate(r[mapping.date]) : null,
    region: mapping.region ? String(r[mapping.region] ?? '').trim() || 'Unknown' : 'Unknown',
    category: mapping.category ? String(r[mapping.category] ?? '').trim() || 'Uncategorised' : 'Uncategorised',
    product: mapping.product ? String(r[mapping.product] ?? '').trim() || `Row ${i+1}` : `Row ${i+1}`,
    quantity: mapping.quantity ? asNumber(r[mapping.quantity]) : 1
  })), [rows, mapping])
  const regionOptions = [...new Set(mappedRows.map(r => r.region))].sort()
  const categoryOptions = [...new Set(mappedRows.map(r => r.category))].sort()
  const filtered = mappedRows.filter(r => (region === 'All regions' || r.region === region) && (category === 'All categories' || r.category === category) && (r.product.toLowerCase().includes(query.toLowerCase()) || r.region.toLowerCase().includes(query.toLowerCase()) || r.category.toLowerCase().includes(query.toLowerCase())))
  const totals = useMemo(() => filtered.reduce((a, r) => ({ sales:a.sales+r.sales, profit:a.profit+r.profit, quantity:a.quantity+r.quantity, orders:a.orders+1 }), {sales:0,profit:0,quantity:0,orders:0}), [filtered])
  const allSales = mappedRows.reduce((a,r)=>a+r.sales,0)
  const allProfit = mappedRows.reduce((a,r)=>a+r.profit,0)
  const margin = totals.sales ? totals.profit / totals.sales * 100 : 0
  const previousMargin = allSales ? allProfit / allSales * 100 : 0

  const trend = useMemo(() => {
    const byMonth = new Map()
    filtered.forEach((r, i) => {
      const key = r.date ? r.date.toLocaleDateString('en-CA', { month:'short', year:'2-digit' }) : `Row ${Math.floor(i / Math.max(1, Math.ceil(filtered.length / 8))) + 1}`
      const existing = byMonth.get(key) || { month:key, sales:0, profit:0, count:0, time:r.date ? r.date.getTime() : i }
      existing.sales += r.sales; existing.profit += r.profit; existing.count++
      byMonth.set(key, existing)
    })
    return [...byMonth.values()].sort((a,b)=>a.time-b.time).slice(-12)
  }, [filtered])
  const regions = useMemo(() => {
    const map = new Map()
    filtered.forEach(r => { const a=map.get(r.region)||{region:r.region,sales:0,profit:0}; a.sales+=r.sales; a.profit+=r.profit; map.set(r.region,a) })
    return [...map.values()].sort((a,b)=>b.sales-a.sales).slice(0,6).map((r,i)=>({...r,color:COLORS[i],share:totals.sales ? r.sales/totals.sales*100 : 0}))
  }, [filtered, totals.sales])
  const cats = useMemo(() => {
    const map = new Map()
    filtered.forEach(r => map.set(r.category,(map.get(r.category)||0)+r.sales))
    return [...map.entries()].map(([name,sales],i)=>({name,sales,share:totals.sales?sales/totals.sales*100:0,color:COLORS[i%COLORS.length]})).sort((a,b)=>b.sales-a.sales).slice(0,6)
  }, [filtered,totals.sales])
  const products = useMemo(() => {
    const map = new Map()
    filtered.forEach(r=>{const a=map.get(r.product)||{name:r.product,category:r.category,sold:0,revenue:0,profit:0};a.sold+=r.quantity;a.revenue+=r.sales;a.profit+=r.profit;map.set(r.product,a)})
    return [...map.values()].sort((a,b)=>b.revenue-a.revenue).filter(p=>p.name.toLowerCase().includes(query.toLowerCase())).slice(0,8)
  }, [filtered,query])
  const productTotal = new Set(filtered.map(r=>r.product)).size

  function exportCSV() {
    const csvRows = [['Date','Product','Category','Region','Sales_INR','Profit_INR','Quantity'], ...filtered.map(r=>[r.date ? r.date.toISOString().slice(0,10) : '',r.product,r.category,r.region,r.sales,r.profit,r.quantity])]
    const csv = csvRows.map(row=>row.map(v=>{const s=String(v ?? '');return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}).join(',')).join('\r\n')
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}))
    const a=document.createElement('a');a.href=url;a.download='sales-report-INR.csv';a.click();URL.revokeObjectURL(url)
  }
  const setField = (key,value) => setMapping(prev=>({...prev,[key]:value}))
  const navGroups = [
    { title:'WORKSPACE', items:[{label:'Overview',icon:LayoutDashboard},{label:'Sales analytics',icon:BarChart3},{label:'Products',icon:ShoppingBag},{label:'Customers',icon:Users}]},
    { title:'MANAGE', items:[{label:'Reports',icon:Activity},{label:'Goals & targets',icon:Target},{label:'Settings',icon:Settings2}]}
  ]
  const mappingFields = [{key:'sales',label:'Sales / revenue',required:true},{key:'profit',label:'Profit'},{key:'date',label:'Date'},{key:'category',label:'Category'},{key:'region',label:'Region / state'},{key:'product',label:'Product / item'},{key:'quantity',label:'Quantity'}]

  return <div className="app-shell">
    {mobileOpen && <button className="mobile-scrim" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"/>}
    <aside className={`sidebar ${mobileOpen?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Command size={21} strokeWidth={2.5}/></div><div><span className="brand-name">metric<span>flow</span></span><span className="brand-caption">SALES INTELLIGENCE</span></div><button className="close-sidebar icon-button" onClick={()=>setMobileOpen(false)} aria-label="Close menu"><X size={19}/></button></div>
      <button className="workspace-switch"><div className="workspace-avatar">₹</div><div className="workspace-copy"><strong>Sales workspace</strong><span>{uploaded?'Custom CSV loaded':'CSV report studio'}</span></div><ChevronDown size={15} className="workspace-chevron"/></button>
      {navGroups.map(group=><div className="nav-group" key={group.title}><p className="nav-heading">{group.title}</p>{group.items.map(item=><button key={item.label} onClick={()=>{setActiveNav(item.label);setMobileOpen(false)}} className={`nav-item ${activeNav===item.label?'active':''}`}><item.icon size={18} strokeWidth={1.8}/><span>{item.label}</span></button>)}</div>)}
      <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={17}/></div><strong>Turn data into decisions</strong><p>Upload a CSV to create a report from your own sales data.</p><button onClick={()=>inputRef.current?.click()}><Upload size={14}/> Upload CSV</button></div><button className="profile-row"><div className="profile-avatar">IN</div><div className="profile-copy"><strong>Indian Rupee</strong><span>Currency: INR (₹)</span></div></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" onClick={()=>setMobileOpen(true)} aria-label="Open menu"><Menu size={20}/></button><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeNav}</strong></div><div className="top-actions"><label className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search product, region..."/><kbd>⌘ K</kbd></label><button className="icon-button notification-button" onClick={()=>setNotice('Tip: import a CSV and confirm its column mapping to get a report from your own data.')} aria-label="Help"><Bell size={18}/></button><span className="top-divider"/><button className="help-button" onClick={()=>setNotice('CSV files are processed in your browser. Your file is not uploaded to a server by this demo.')}><CircleHelp size={17}/><span>How it works</span></button></div></header>
      {notice && <div className="notice-banner"><Lightbulb size={17}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss notice"><X size={16}/></button></div>}
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow"><span className="live-dot"/> CSV-POWERED BUSINESS OVERVIEW</div><h1>{activeNav==='Overview'?'Sales overview':activeNav}</h1><p>Upload your own CSV and turn raw rows into an interactive sales report.</p></div><div className="heading-actions"><input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={e=>{handleFile(e.target.files?.[0]);e.target.value=''}}/><button className="secondary-button" onClick={()=>{setRows(DEMO);setHeaders(Object.keys(DEMO[0]));setMapping({sales:'Sales',profit:'Profit',date:'Order Date',category:'Category',region:'Region',product:'Product Name',quantity:'Quantity'});setFileName('Sample sales data');setUploaded(false);setNotice('Sample data restored. Upload your CSV whenever you are ready.')}}><RefreshCw size={15}/> Demo data</button><button className="primary-button" onClick={()=>inputRef.current?.click()}><Upload size={16}/> Upload CSV</button><button className="export-button" onClick={exportCSV} disabled={!filtered.length}><Download size={16}/> Export report</button></div></div>
        <div className="upload-strip"><div className="upload-file-icon"><FileSpreadsheet size={21}/></div><div className="upload-file-copy"><strong>{fileName}</strong><span>{rows.length.toLocaleString()} rows · {headers.length} columns · {uploaded?'Your uploaded file':'Example dataset'} · Amounts shown in Indian Rupees (₹)</span></div>{uploaded&&<span className="imported-status"><CheckCircle2 size={14}/> Imported</span>}<button className="upload-link" onClick={()=>inputRef.current?.click()}>{uploaded?'Replace file':'Choose CSV'} <ArrowUpRight size={14}/></button></div>

        {uploaded&&<section className="panel mapping-panel"><div className="panel-heading mapping-heading"><div><h2>Match your CSV columns</h2><p>We guessed these fields from your headers. Adjust any incorrect match to update the report.</p></div><span className="mapping-hint">Required: Sales / revenue</span></div><div className="mapping-grid">{mappingFields.map(f=><label className="mapping-field" key={f.key}><span>{f.label}{f.required?' *':''}</span><div className="select-wrap"><select value={mapping[f.key]||''} onChange={e=>setField(f.key,e.target.value)}><option value="">— Not mapped —</option>{headers.map(h=><option key={h} value={h}>{h}</option>)}</select><ChevronDown size={13}/></div></label>)}</div>{!mapping.sales&&<p className="mapping-warning">Choose the column that contains the sales or revenue amount.</p>}</section>}

        <div className="filter-row"><div className="filter-caption"><SlidersHorizontal size={15}/> Filters</div><div className="select-wrap filter-select"><select value={region} onChange={e=>setRegion(e.target.value)} aria-label="Filter region"><option>All regions</option>{regionOptions.map(v=><option key={v}>{v}</option>)}</select><ChevronDown size={14}/></div><div className="select-wrap filter-select"><select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filter category"><option>All categories</option>{categoryOptions.map(v=><option key={v}>{v}</option>)}</select><ChevronDown size={14}/></div><span className="filter-result">Showing {filtered.length.toLocaleString()} of {rows.length.toLocaleString()} rows <span>·</span> Live report</span><button className="reset-button" onClick={()=>{setRegion('All regions');setCategory('All categories');setQuery('')}}>Reset filters</button></div>

        <section className="stats-grid"><StatCard icon={TrendingUp} label="Total sales / revenue" value={money(totals.sales)} change={`${filtered.length.toLocaleString()} rows`} note="in selected data" tone="purple"/><StatCard icon={Target} label="Total profit" value={money(totals.profit)} change={`${margin.toFixed(1)}% margin`} note="profit / sales" tone="green"/><StatCard icon={ShoppingBag} label="Transactions" value={totals.orders.toLocaleString('en-IN')} change={`${totals.quantity.toLocaleString('en-IN')} units`} note="quantity, if mapped" tone="orange"/><StatCard icon={Package} label="Products represented" value={productTotal.toLocaleString('en-IN')} change={`${cats.length} categories`} note="in selected data" tone="pink"/></section>

        {!mapping.sales&&<div className="mapping-warning warning-large">Map a Sales / revenue column above to calculate meaningful financial totals.</div>}
        <section className="primary-grid">
          <article className="panel revenue-panel"><div className="panel-heading"><div><h2>Sales & profit trend</h2><p>{mapping.date?'Grouped by month using your date column':'Grouped into row batches because no date column is mapped'}</p></div><span className="chart-unit">Currency: INR ₹</span></div><div className="chart-legend"><span><i className="legend-dot revenue-dot"/>Sales</span><span><i className="legend-dot profit-dot"/>Profit</span><span className="legend-period">{trend.length} periods</span></div><div className="revenue-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{top:10,right:8,left:-13,bottom:0}}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7779f7" stopOpacity={.19}/><stop offset="95%" stopColor="#7779f7" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#edf0f6" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#8c95a7',fontSize:11}} dy={10}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#8c95a7',fontSize:11}} tickFormatter={shortMoney} width={53}/><Tooltip formatter={v=>money(v)} contentStyle={{border:'1px solid #edf0f6',borderRadius:12}}/><Area type="monotone" dataKey="sales" name="Sales" stroke="#7779f7" strokeWidth={2.7} fill="url(#revenueFill)" activeDot={{r:5,strokeWidth:0}}/><Line type="monotone" dataKey="profit" name="Profit" stroke="#36b89f" strokeWidth={2.4} dot={false}/></AreaChart></ResponsiveContainer></div><div className="chart-footer"><span><span className="footer-dot purple-dot"/> Based on <strong>{filtered.length.toLocaleString()} filtered rows</strong></span><button onClick={exportCSV}>Download report <Download size={14}/></button></div></article>
          <article className="panel region-panel"><div className="panel-heading"><div><h2>Sales by region</h2><p>Revenue distribution by mapped region</p></div></div><div className="region-chart-wrap"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={regions} dataKey="sales" nameKey="region" innerRadius={62} outerRadius={84} paddingAngle={3} stroke="none">{regions.map((r,i)=><Cell key={r.region} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={v=>money(v)}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{shortMoney(totals.sales)}</strong><span>Total sales</span></div></div></div><div className="region-legend">{regions.map((r,i)=><div className="region-row" key={r.region}><span className="region-name"><i style={{background:COLORS[i%COLORS.length]}}/>{r.region}</span><strong>{r.share.toFixed(1)}%</strong><span className="region-amount">{shortMoney(r.sales)}</span></div>)}{!regions.length&&<p className="empty-state">No region data to chart.</p>}</div></article>
        </section>
        <section className="secondary-grid"><article className="panel category-panel"><div className="panel-heading"><div><h2>Sales by category</h2><p>Share of total sales</p></div></div><div className="category-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={cats} layout="vertical" margin={{top:4,right:16,left:4,bottom:0}} barCategoryGap={15}><CartesianGrid stroke="#edf0f6" horizontal={false}/><XAxis type="number" axisLine={false} tickLine={false} tick={{fill:'#8c95a7',fontSize:11}} tickFormatter={v=>shortMoney(v)}/><YAxis type="category" dataKey="name" width={112} axisLine={false} tickLine={false} tick={{fill:'#69758a',fontSize:11}}/><Tooltip formatter={v=>money(v)}/><Bar dataKey="sales" name="Sales" radius={[0,5,5,0]} barSize={17}>{cats.map((c,i)=><Cell key={c.name} fill={COLORS[i%COLORS.length]}/>)}</Bar></BarChart></ResponsiveContainer></div></article>
          <article className="panel products-panel"><div className="panel-heading"><div><h2>Top products / items</h2><p>Ranked by total sales value</p></div><button className="text-link" onClick={exportCSV}>Export rows <ArrowUpRight size={14}/></button></div><div className="product-table-wrap"><table className="product-table"><thead><tr><th>PRODUCT / ITEM</th><th>CATEGORY</th><th>UNITS</th><th>SALES (INR)</th><th>PROFIT</th></tr></thead><tbody>{products.map((p,i)=><tr key={p.name}><td><div className="product-cell"><span className="product-thumb" style={{background:COLORS[i%COLORS.length]+'18',color:COLORS[i%COLORS.length]}}><Package size={17}/></span><span><strong>{p.name}</strong><small>{p.category}</small></span></div></td><td>{p.category}</td><td>{p.sold.toLocaleString('en-IN')}</td><td className="revenue-cell">{money(p.revenue)}</td><td>{money(p.profit)}</td></tr>)}</tbody></table>{!products.length&&<div className="empty-state">No products match your search.</div>}</div></article></section>
        <section className="panel summary-panel"><div className="panel-heading"><div><h2>Quick data summary</h2><p>Calculated from the currently filtered rows</p></div><button className="text-link" onClick={exportCSV}><Download size={14}/> Export filtered CSV</button></div><div className="summary-grid"><div><span>Average sales per row</span><strong>{money(totals.orders?totals.sales/totals.orders:0)}</strong></div><div><span>Average profit per row</span><strong>{money(totals.orders?totals.profit/totals.orders:0)}</strong></div><div><span>Profit margin</span><strong>{margin.toFixed(2)}%</strong></div><div><span>Rows with a date</span><strong>{filtered.filter(r=>r.date).length.toLocaleString('en-IN')}</strong></div></div></section>
        <footer className="page-footer"><span>© 2026 Metricflow Analytics</span><span><i className="footer-status"/> CSV processed in your browser</span><span>All financial values in INR ₹ <Sparkles size={13}/></span></footer>
      </div>
    </main>
  </div>
}
export default App

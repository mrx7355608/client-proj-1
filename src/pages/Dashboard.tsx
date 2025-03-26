import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DollarSign, Users, Wallet, Handshake } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, subYears, startOfYear } from 'date-fns';

interface DashboardStats {
  totalMRR: number;
  totalClients: number;
  mspClients: number;
  unmClients: number;
  totalGlobalExpenses: number;
  mrrGrowthRate: number;
}

interface ChartData {
  date: string;
  mrr: number;
  expenses: number;
  payouts: number;
}

interface VisibleLines {
  mrr: boolean;
  expenses: boolean;
  payouts: boolean;
}

type TimeRange = 'YTD' | '1Y' | '2Y' | '3Y' | '4Y' | '5Y';

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMRR: 0,
    totalClients: 0,
    mspClients: 0,
    unmClients: 0,
    totalGlobalExpenses: 0,
    mrrGrowthRate: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('YTD');
  const [visibleLines, setVisibleLines] = useState<VisibleLines>({
    mrr: true,
    expenses: true,
    payouts: true,
  });

  useEffect(() => {
    async function fetchStats() {
      const [clientsResponse, expensesResponse] = await Promise.all([
        supabase.from('clients').select('mrr, start_date, client_type'),
        supabase.from('global_expenses').select('amount')
      ]);

      const clients = clientsResponse.data || [];
      const totalMRR = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
      const totalClients = clients.length;
      const mspClients = clients.filter(client => client.client_type === 'msp').length;
      const unmClients = clients.filter(client => client.client_type === 'unm').length;
      const totalGlobalExpenses = expensesResponse.data?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;

      // Calculate YTD growth rate
      const startOfYearDate = startOfYear(new Date());
      const clientsAtStartOfYear = clients.filter(client => 
        new Date(client.start_date) < startOfYearDate
      );
      const mrrAtStartOfYear = clientsAtStartOfYear.reduce((sum, client) => sum + (client.mrr || 0), 0);
      
      const mrrGrowthRate = mrrAtStartOfYear > 0 
        ? ((totalMRR - mrrAtStartOfYear) / mrrAtStartOfYear) * 100 
        : 100;

      setStats({
        totalMRR,
        totalClients,
        mspClients,
        unmClients,
        totalGlobalExpenses,
        mrrGrowthRate,
      });
    }

    fetchStats();
  }, []);

  useEffect(() => {
    fetchChartData(timeRange);
  }, [timeRange]);

  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    switch (range) {
      case 'YTD':
        return {
          start: startOfYear(now),
          months: now.getMonth() + 1
        };
      case '1Y':
        return {
          start: subYears(now, 1),
          months: 12
        };
      case '2Y':
        return {
          start: subYears(now, 2),
          months: 24
        };
      case '3Y':
        return {
          start: subYears(now, 3),
          months: 36
        };
      case '4Y':
        return {
          start: subYears(now, 4),
          months: 48
        };
      case '5Y':
        return {
          start: subYears(now, 5),
          months: 60
        };
    }
  };

  const toggleLine = (line: keyof VisibleLines) => {
    setVisibleLines(prev => ({
      ...prev,
      [line]: !prev[line]
    }));
  };

  async function fetchChartData(range: TimeRange) {
    try {
      // Get all clients with their start dates and MRR
      const { data: clients } = await supabase
        .from('clients')
        .select('mrr, start_date');

      // Get all global expenses
      const { data: expenses } = await supabase
        .from('global_expenses')
        .select('amount, start_date');

      // Get all partner revenue shares
      const { data: revenueShares } = await supabase
        .from('partner_revenue_shares')
        .select(`
          percentage,
          flat_rate,
          start_date,
          end_date,
          client:clients (
            mrr
          )
        `);

      const { start, months } = getDateRange(range);

      // Generate months array based on the selected range
      const monthsArray = Array.from({ length: months }, (_, i) => {
        const date = subMonths(new Date(), i);
        return {
          start: startOfMonth(date),
          end: endOfMonth(date),
          label: format(date, 'MMM yyyy')
        };
      }).reverse();

      const data: ChartData[] = monthsArray.map(month => {
        // Calculate MRR for this month
        const monthlyMRR = (clients || []).reduce((sum, client) => {
          const clientStartDate = new Date(client.start_date);
          return clientStartDate <= month.end ? sum + (client.mrr || 0) : sum;
        }, 0);

        // Calculate expenses for this month
        const monthlyExpenses = (expenses || []).reduce((sum, expense) => {
          const expenseStartDate = new Date(expense.start_date);
          return expenseStartDate <= month.end ? sum + (expense.amount || 0) : sum;
        }, 0);

        // Calculate partner payouts for this month
        const monthlyPayouts = (revenueShares || []).reduce((sum, share) => {
          const shareStartDate = new Date(share.start_date);
          const shareEndDate = share.end_date ? new Date(share.end_date) : null;
          
          if (shareStartDate <= month.end && (!shareEndDate || shareEndDate >= month.start)) {
            if (share.flat_rate) {
              return sum + share.flat_rate;
            } else if (share.percentage && share.client) {
              return sum + ((share.client.mrr * share.percentage) / 100);
            }
          }
          return sum;
        }, 0);

        return {
          date: month.label,
          mrr: monthlyMRR,
          expenses: monthlyExpenses,
          payouts: monthlyPayouts
        };
      });

      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  }

  // Calculate Y-axis ticks based on MRR
  const calculateYAxisTicks = (data: ChartData[]) => {
    // Find max value between MRR, expenses and payouts
    const maxValue = Math.max(
      ...data.map(d => Math.max(d.mrr || 0, d.expenses || 0, d.payouts || 0))
    );
    
    // Round up to next thousand
    const nextThousand = Math.ceil(maxValue / 1000) * 1000;
    
    // Generate 10 evenly spaced ticks from 0 to nextThousand
    return Array.from({ length: 11 }, (_, i) => Math.round(nextThousand / 10 * i));
  };

  // Custom tooltip component that only shows the closest line
  const CustomTooltip = ({ active, payload, label, coordinate }: any) => {
    if (!active || !payload || !payload.length) return null;

    // Get visible lines
    const visiblePayload = payload.filter((item: any) => {
      const key = item.dataKey as keyof VisibleLines;
      return visibleLines[key];
    });

    if (visiblePayload.length === 0) return null;

    // Find the line with the smallest distance to the cursor
    let closestLine = visiblePayload[0];
    let smallestDistance = Infinity;

    visiblePayload.forEach((item: any) => {
      const distance = Math.abs(coordinate.y - item.payload[item.dataKey]);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestLine = item;
      }
    });

    const labels = {
      mrr: 'Monthly Recurring Revenue',
      expenses: 'Monthly Expenses',
      payouts: 'Partner Payouts'
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-sm font-medium" style={{ color: closestLine.color }}>
          {labels[closestLine.dataKey as keyof typeof labels]}: ${closestLine.value.toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Monthly Recurring Revenue"
          value={`$${stats.totalMRR.toLocaleString()}`}
          subValue={`${stats.mrrGrowthRate >= 0 ? '+' : ''}${stats.mrrGrowthRate.toFixed(1)}% YTD`}
          subValueColor={stats.mrrGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}
          icon={<DollarSign size={16} />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients.toString()}
          subValues={[
            { value: `${stats.mspClients} MSP`, color: 'bg-blue-50 text-blue-600' },
            { value: `${stats.unmClients} UNM`, color: 'bg-purple-50 text-purple-600' }
          ]}
          icon={<Users size={16} />}
          color="bg-blue-500"
        />
        <StatCard
          title="Monthly Global Expenses"
          value={`$${stats.totalGlobalExpenses.toLocaleString()}`}
          icon={<Wallet size={16} />}
          color="bg-red-500"
        />
        <StatCard
          title="Monthly Partner Payouts"
          value={chartData.length > 0 ? `$${chartData[chartData.length - 1].payouts.toLocaleString()}` : '$0'}
          icon={<Handshake size={16} />}
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Revenue vs Expenses Trend</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="YTD">Year to Date</option>
            <option value="1Y">1 Year</option>
            <option value="2Y">2 Years</option>
            <option value="3Y">3 Years</option>
            <option value="4Y">4 Years</option>
            <option value="5Y">5 Years</option>
          </select>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => toggleLine('mrr')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              visibleLines.mrr 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => toggleLine('expenses')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              visibleLines.expenses 
                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => toggleLine('payouts')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              visibleLines.payouts 
                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Partner Payouts
          </button>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="payoutsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#6b7280' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={{ stroke: '#6b7280' }}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                ticks={calculateYAxisTicks(chartData)}
                domain={[0, 'dataMax + 1000']}
                tickMargin={8}
              />
              <Tooltip content={<CustomTooltip />} />
              {visibleLines.mrr && (
                <Area
                  type="monotone"
                  dataKey="mrr"
                  name="Monthly Recurring Revenue"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#mrrGradient)"
                  animationDuration={500}
                  isAnimationActive={true}
                />
              )}
              {visibleLines.expenses && (
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Monthly Expenses"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#expensesGradient)"
                  animationDuration={500}
                  isAnimationActive={true}
                />
              )}
              {visibleLines.payouts && (
                <Area
                  type="monotone"
                  dataKey="payouts"
                  name="Partner Payouts"
                  stroke="#a855f7"
                  fillOpacity={1}
                  fill="url(#payoutsGradient)"
                  animationDuration={500}
                  isAnimationActive={true}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subValue, 
  subValues,
  subValueColor,
  icon, 
  color 
}: {
  title: string;
  value: string;
  subValue?: string;
  subValues?: { value: string; color: string }[];
  subValueColor?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center">
        <div className={`${color} p-2 rounded-full text-white mr-3`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-gray-800 mt-0.5">{value}</p>
            {subValue && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                subValueColor === 'text-green-600' ? 'bg-green-50' : 
                subValueColor === 'text-red-600' ? 'bg-red-50' :
                'bg-blue-50'
              } ${subValueColor}`}>
                {subValue}
              </span>
            )}
            {subValues && (
              <div className="flex gap-2">
                {subValues.map((sub, index) => (
                  <span key={index} className={`text-xs font-semibold px-2 py-1 rounded-full ${sub.color}`}>
                    {sub.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
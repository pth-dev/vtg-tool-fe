import { useMemo } from 'react'

import { useTheme } from '@mui/material'

import { ApexOptions } from 'apexcharts'

// Shadcn-inspired chart colors
const chartColors = {
  light: [
    '#2563eb', // blue
    '#16a34a', // green
    '#ea580c', // orange
    '#dc2626', // red
    '#9333ea', // purple
    '#0891b2', // cyan
    '#ca8a04', // yellow
    '#be185d', // pink
  ],
  dark: [
    '#60a5fa', // blue
    '#4ade80', // green
    '#fb923c', // orange
    '#f87171', // red
    '#c084fc', // purple
    '#22d3ee', // cyan
    '#facc15', // yellow
    '#f472b6', // pink
  ],
}

export function useChartTheme(): ApexOptions {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return useMemo(
    () => ({
      chart: {
        background: 'transparent',
        foreColor: isDark ? '#a1a1aa' : '#71717a',
        fontFamily: 'Inter, Roboto, sans-serif',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 400,
        },
      },
      colors: isDark ? chartColors.dark : chartColors.light,
      grid: {
        borderColor: isDark ? '#27272a' : '#e4e4e7',
        strokeDashArray: 4,
        xaxis: {
          lines: { show: false },
        },
        yaxis: {
          lines: { show: true },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
      xaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: isDark ? '#a1a1aa' : '#71717a',
            fontSize: '12px',
            fontFamily: 'Inter, Roboto, sans-serif',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: isDark ? '#a1a1aa' : '#71717a',
            fontSize: '12px',
            fontFamily: 'Inter, Roboto, sans-serif',
          },
        },
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, Roboto, sans-serif',
        },
        x: {
          show: true,
        },
        y: {
          formatter: (val: number) => val?.toLocaleString() || '0',
        },
      },
      legend: {
        labels: {
          colors: isDark ? '#fafafa' : '#09090b',
        },
        markers: {
          size: 8,
        },
        itemMargin: {
          horizontal: 12,
          vertical: 4,
        },
      },
      dataLabels: {
        enabled: false,
        style: {
          colors: isDark ? ['#fafafa'] : ['#09090b'],
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        opacity: 1,
        type: 'solid',
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '60%',
        },
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: {
                color: isDark ? '#fafafa' : '#09090b',
              },
              value: {
                color: isDark ? '#a1a1aa' : '#71717a',
                formatter: (val: string) => Number(val).toLocaleString(),
              },
              total: {
                show: true,
                color: isDark ? '#fafafa' : '#09090b',
                formatter: (w: any) => {
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)
                  return total.toLocaleString()
                },
              },
            },
          },
        },
        radialBar: {
          hollow: {
            size: '70%',
          },
          track: {
            background: isDark ? '#27272a' : '#e4e4e7',
          },
          dataLabels: {
            name: {
              color: isDark ? '#fafafa' : '#09090b',
            },
            value: {
              color: isDark ? '#a1a1aa' : '#71717a',
            },
          },
        },
      },
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.9,
          },
        },
        active: {
          filter: {
            type: 'darken',
            value: 0.85,
          },
        },
      },
    }),
    [isDark]
  )
}

export { chartColors }

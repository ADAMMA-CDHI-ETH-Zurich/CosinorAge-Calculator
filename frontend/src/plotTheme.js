// CL-inspired plot theme configurations
// This file contains theme configurations for various plotting libraries

// Common CL colors for plots
export const CLColors = {
  primary: "#1A1A1A",      // Deep black
  secondary: "#0066CC",    // CL blue
  accent: "#666666",       // Medium gray
  background: "#FFFFFF",   // White
  grid: "#E0E0E0",         // Light gray for grids
  text: "#1A1A1A",         // Primary text
  textSecondary: "#666666", // Secondary text
  success: "#2E7D32",      // Green
  warning: "#ED6C02",      // Orange
  error: "#D32F2F",        // Red
  info: "#0288D1",         // Light blue
};

// Plotly.js theme configuration
export const plotlyTheme = {
  layout: {
    font: {
      family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      size: 12,
      color: CLColors.text,
    },
    title: {
      font: {
        family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
        size: 16,
        color: CLColors.text,
      },
    },
    paper_bgcolor: CLColors.background,
    plot_bgcolor: CLColors.background,
    xaxis: {
      gridcolor: CLColors.grid,
      zerolinecolor: CLColors.grid,
      linecolor: CLColors.grid,
      tickfont: {
        family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
        size: 11,
        color: CLColors.textSecondary,
      },
      titlefont: {
        family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
        size: 12,
        color: CLColors.text,
      },
    },
    yaxis: {
      gridcolor: CLColors.grid,
      zerolinecolor: CLColors.grid,
      linecolor: CLColors.grid,
      tickfont: {
        family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
        size: 11,
        color: CLColors.textSecondary,
      },
      titlefont: {
        family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
        size: 12,
        color: CLColors.text,
      },
    },
    legend: {
      font: {
        family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
        size: 11,
        color: CLColors.text,
      },
      bgcolor: CLColors.background,
      bordercolor: CLColors.grid,
    },
    margin: {
      l: 60,
      r: 40,
      t: 60,
      b: 60,
    },
  },
  data: {
    // Default colors for traces
    colors: [
      CLColors.primary,
      CLColors.secondary,
      CLColors.success,
      CLColors.warning,
      CLColors.error,
      CLColors.info,
      CLColors.accent,
    ],
  },
};

// Chart.js theme configuration
export const chartJsTheme = {
  type: 'line',
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
            size: 12,
          },
          color: CLColors.text,
        },
      },
      title: {
        display: true,
        font: {
          family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
          size: 16,
          weight: '600',
        },
        color: CLColors.text,
      },
    },
    scales: {
      x: {
        grid: {
          color: CLColors.grid,
          borderColor: CLColors.grid,
        },
        ticks: {
          font: {
            family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
            size: 11,
          },
          color: CLColors.textSecondary,
        },
        title: {
          font: {
            family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
            size: 12,
          },
          color: CLColors.text,
        },
      },
      y: {
        grid: {
          color: CLColors.grid,
          borderColor: CLColors.grid,
        },
        ticks: {
          font: {
            family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
            size: 11,
          },
          color: CLColors.textSecondary,
        },
        title: {
          font: {
            family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
            size: 12,
          },
          color: CLColors.text,
        },
      },
    },
  },
  data: {
    datasets: [{
      borderColor: CLColors.secondary,
      backgroundColor: CLColors.secondary + '20', // 20% opacity
      borderWidth: 2,
      pointBackgroundColor: CLColors.secondary,
      pointBorderColor: CLColors.background,
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  },
};

// D3.js theme configuration
export const d3Theme = {
  colors: [
    CLColors.primary,
    CLColors.secondary,
    CLColors.success,
    CLColors.warning,
    CLColors.error,
    CLColors.info,
    CLColors.accent,
  ],
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
  fontSize: {
    small: 11,
    medium: 12,
    large: 14,
    title: 16,
  },
  colors: {
    text: CLColors.text,
    textSecondary: CLColors.textSecondary,
    background: CLColors.background,
    grid: CLColors.grid,
    axis: CLColors.grid,
  },
  stroke: {
    width: 2,
    color: CLColors.secondary,
  },
  fill: {
    opacity: 0.8,
  },
};

// Recharts theme configuration
export const rechartsTheme = {
  colors: [
    CLColors.primary,
    CLColors.secondary,
    CLColors.success,
    CLColors.warning,
    CLColors.error,
    CLColors.info,
    CLColors.accent,
  ],
  style: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
  },
};

// Matplotlib-style theme (for Python backend plots)
export const matplotlibTheme = {
  style: {
    'figure.facecolor': CLColors.background,
    'axes.facecolor': CLColors.background,
    'axes.edgecolor': CLColors.grid,
    'axes.labelcolor': CLColors.text,
    'axes.titlecolor': CLColors.text,
    'xtick.color': CLColors.textSecondary,
    'ytick.color': CLColors.textSecondary,
    'grid.color': CLColors.grid,
    'grid.alpha': 0.3,
    'text.color': CLColors.text,
    'font.family': 'Inter, Roboto, Helvetica Neue, Arial, sans-serif',
    'font.size': 12,
    'axes.titlesize': 14,
    'axes.labelsize': 12,
    'xtick.labelsize': 11,
    'ytick.labelsize': 11,
    'legend.fontsize': 11,
    'figure.titlesize': 16,
  },
  colors: [
    CLColors.primary,
    CLColors.secondary,
    CLColors.success,
    CLColors.warning,
    CLColors.error,
    CLColors.info,
    CLColors.accent,
  ],
};

// Seaborn-style theme (for Python backend plots)
export const seabornTheme = {
  style: {
    'figure.facecolor': CLColors.background,
    'axes.facecolor': CLColors.background,
    'axes.edgecolor': CLColors.grid,
    'axes.labelcolor': CLColors.text,
    'axes.titlecolor': CLColors.text,
    'xtick.color': CLColors.textSecondary,
    'ytick.color': CLColors.textSecondary,
    'grid.color': CLColors.grid,
    'grid.alpha': 0.3,
    'text.color': CLColors.text,
    'font.family': 'Inter, Roboto, Helvetica Neue, Arial, sans-serif',
    'font.size': 12,
    'axes.titlesize': 14,
    'axes.labelsize': 12,
    'xtick.labelsize': 11,
    'ytick.labelsize': 11,
    'legend.fontsize': 11,
    'figure.titlesize': 16,
  },
  palette: [
    CLColors.primary,
    CLColors.secondary,
    CLColors.success,
    CLColors.warning,
    CLColors.error,
    CLColors.info,
    CLColors.accent,
  ],
};

// Utility function to apply theme to existing plot configurations
export const applyPlotTheme = (plotConfig, library = 'plotly') => {
  switch (library.toLowerCase()) {
    case 'plotly':
      return {
        ...plotConfig,
        layout: {
          ...plotlyTheme.layout,
          ...plotConfig.layout,
        },
        data: plotConfig.data?.map(trace => ({
          ...trace,
          line: trace.line ? { ...trace.line, color: trace.line.color || CLColors.secondary } : undefined,
          marker: trace.marker ? { ...trace.marker, color: trace.marker.color || CLColors.secondary } : undefined,
        })) || plotConfig.data,
      };
    
    case 'chartjs':
      return {
        ...plotConfig,
        options: {
          ...chartJsTheme.options,
          ...plotConfig.options,
        },
        data: {
          ...chartJsTheme.data,
          ...plotConfig.data,
        },
      };
    
    case 'd3':
      return {
        ...plotConfig,
        ...d3Theme,
        ...plotConfig,
      };
    
    case 'recharts':
      return {
        ...plotConfig,
        ...rechartsTheme,
        ...plotConfig,
      };
    
    default:
      return plotConfig;
  }
};

// CSS styles for plot containers
export const plotContainerStyles = {
  container: {
    backgroundColor: CLColors.background,
    borderRadius: '4px',
    border: `1px solid ${CLColors.grid}`,
    padding: '16px',
    margin: '8px 0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  },
  title: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    fontSize: '16px',
    fontWeight: 600,
    color: CLColors.text,
    marginBottom: '12px',
  },
  subtitle: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    fontSize: '12px',
    color: CLColors.textSecondary,
    marginBottom: '16px',
  },
};

export default {
  CLColors,
  plotlyTheme,
  chartJsTheme,
  d3Theme,
  rechartsTheme,
  matplotlibTheme,
  seabornTheme,
  applyPlotTheme,
  plotContainerStyles,
}; 
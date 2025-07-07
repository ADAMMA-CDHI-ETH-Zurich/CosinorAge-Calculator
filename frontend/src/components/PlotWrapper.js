import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { plotContainerStyles, applyPlotTheme } from '../plotTheme';

/**
 * PlotWrapper - A React component that wraps plots with CL styling
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The plot component to wrap
 * @param {string} props.title - Plot title
 * @param {string} props.subtitle - Plot subtitle
 * @param {string} props.library - Plot library ('plotly', 'chartjs', 'd3', 'recharts')
 * @param {Object} props.plotConfig - Plot configuration object
 * @param {Object} props.containerProps - Additional props for the container
 * @param {Object} props.titleProps - Additional props for the title
 * @param {Object} props.subtitleProps - Additional props for the subtitle
 */
const PlotWrapper = ({
  children,
  title,
  subtitle,
  library = 'plotly',
  plotConfig = {},
  containerProps = {},
  titleProps = {},
  subtitleProps = {},
  ...otherProps
}) => {
  // Apply CL theme to plot configuration
  const themedPlotConfig = applyPlotTheme(plotConfig, library);

  return (
    <Paper
      elevation={1}
      sx={{
        ...plotContainerStyles.container,
        ...containerProps.sx,
      }}
      {...containerProps}
      {...otherProps}
    >
      {title && (
        <Typography
          variant="h6"
          sx={{
            ...plotContainerStyles.title,
            ...titleProps.sx,
          }}
          {...titleProps}
        >
          {title}
        </Typography>
      )}
      
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            ...plotContainerStyles.subtitle,
            ...subtitleProps.sx,
          }}
          {...subtitleProps}
        >
          {subtitle}
        </Typography>
      )}
      
      <Box sx={{ width: '100%', height: 'auto' }}>
        {React.cloneElement(children, {
          ...themedPlotConfig,
          ...children.props,
        })}
      </Box>
    </Paper>
  );
};

export default PlotWrapper;

/**
 * Example usage components for different plot libraries
 */

// Plotly.js wrapper
export const PlotlyWrapper = ({ data, layout, config, ...props }) => {
  const plotlyConfig = {
    data,
    layout: {
      ...layout,
      font: {
        family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
        size: 12,
        color: '#1A1A1A',
      },
      paper_bgcolor: '#FFFFFF',
      plot_bgcolor: '#FFFFFF',
      xaxis: {
        gridcolor: '#E0E0E0',
        zerolinecolor: '#E0E0E0',
        linecolor: '#E0E0E0',
        tickfont: {
          family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
          size: 11,
          color: '#666666',
        },
        titlefont: {
          family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
          size: 12,
          color: '#1A1A1A',
        },
        ...layout?.xaxis,
      },
      yaxis: {
        gridcolor: '#E0E0E0',
        zerolinecolor: '#E0E0E0',
        linecolor: '#E0E0E0',
        tickfont: {
          family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
          size: 11,
          color: '#666666',
        },
        titlefont: {
          family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
          size: 12,
          color: '#1A1A1A',
        },
        ...layout?.yaxis,
      },
      legend: {
        font: {
          family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
          size: 11,
          color: '#1A1A1A',
        },
        bgcolor: '#FFFFFF',
        bordercolor: '#E0E0E0',
        ...layout?.legend,
      },
      margin: {
        l: 60,
        r: 40,
        t: 60,
        b: 60,
        ...layout?.margin,
      },
    },
    config: {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
      ...config,
    },
  };

  return (
    <PlotWrapper
      library="plotly"
      plotConfig={plotlyConfig}
      {...props}
    >
      {/* Plotly component would go here */}
      <div>Plotly Plot Component</div>
    </PlotWrapper>
  );
};

// Chart.js wrapper
export const ChartJsWrapper = ({ data, options, type = 'line', ...props }) => {
  const chartJsConfig = {
    type,
    data: {
      datasets: data.datasets?.map((dataset, index) => ({
        borderColor: '#0066CC',
        backgroundColor: '#0066CC20',
        borderWidth: 2,
        pointBackgroundColor: '#0066CC',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        ...dataset,
      })) || data.datasets,
      labels: data.labels,
    },
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
            color: '#1A1A1A',
          },
        },
        title: {
          display: true,
          font: {
            family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
            size: 16,
            weight: '600',
          },
          color: '#1A1A1A',
        },
      },
      scales: {
        x: {
          grid: {
            color: '#E0E0E0',
            borderColor: '#E0E0E0',
          },
          ticks: {
            font: {
              family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
              size: 11,
            },
            color: '#666666',
          },
          title: {
            font: {
              family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
              size: 12,
            },
            color: '#1A1A1A',
          },
        },
        y: {
          grid: {
            color: '#E0E0E0',
            borderColor: '#E0E0E0',
          },
          ticks: {
            font: {
              family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
              size: 11,
            },
            color: '#666666',
          },
          title: {
            font: {
              family: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
              size: 12,
            },
            color: '#1A1A1A',
          },
        },
      },
      ...options,
    },
  };

  return (
    <PlotWrapper
      library="chartjs"
      plotConfig={chartJsConfig}
      {...props}
    >
      {/* Chart.js component would go here */}
      <div>Chart.js Component</div>
    </PlotWrapper>
  );
};

// Recharts wrapper
export const RechartsWrapper = ({ children, ...props }) => {
  const rechartsConfig = {
    colors: [
      '#1A1A1A',
      '#0066CC',
      '#2E7D32',
      '#ED6C02',
      '#D32F2F',
      '#0288D1',
      '#666666',
    ],
    style: {
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    },
  };

  return (
    <PlotWrapper
      library="recharts"
      plotConfig={rechartsConfig}
      {...props}
    >
      {children}
    </PlotWrapper>
  );
};

// D3.js wrapper
export const D3Wrapper = ({ children, ...props }) => {
  const d3Config = {
    colors: [
      '#1A1A1A',
      '#0066CC',
      '#2E7D32',
      '#ED6C02',
      '#D32F2F',
      '#0288D1',
      '#666666',
    ],
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    fontSize: {
      small: 11,
      medium: 12,
      large: 14,
      title: 16,
    },
    colors: {
      text: '#1A1A1A',
      textSecondary: '#666666',
      background: '#FFFFFF',
      grid: '#E0E0E0',
      axis: '#E0E0E0',
    },
    stroke: {
      width: 2,
      color: '#0066CC',
    },
    fill: {
      opacity: 0.8,
    },
  };

  return (
    <PlotWrapper
      library="d3"
      plotConfig={d3Config}
      {...props}
    >
      {children}
    </PlotWrapper>
  );
}; 
# CL Plot Theme Implementation Guide

This guide explains how to implement the CL-inspired plot theme across your CosinorLab application.

## Overview

The CL plot theme provides consistent, professional styling for all visualizations in your application, matching the sophisticated design aesthetic of CL's website.

## Files Created

1. **`frontend/src/plotTheme.js`** - Frontend theme configurations for various plotting libraries
2. **`backend/plot_config.py`** - Python backend theme configurations for matplotlib/seaborn
3. **`frontend/src/components/PlotWrapper.js`** - React wrapper components for easy theme application
4. **`PLOT_THEME_USAGE.md`** - This usage guide

## Color Palette

The CL theme uses these professional colors:

```javascript
const CLColors = {
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
```

## Frontend Implementation

### 1. Using PlotWrapper Components

The easiest way to apply the CL theme is using the provided wrapper components:

```jsx
import { PlotlyWrapper, ChartJsWrapper, RechartsWrapper } from './components/PlotWrapper';

// Plotly.js example
<PlotlyWrapper
  title="Cosinor Analysis Results"
  subtitle="Amplitude and phase analysis over time"
  data={plotData}
  layout={plotLayout}
/>

// Chart.js example
<ChartJsWrapper
  title="Circadian Rhythm Data"
  subtitle="24-hour cycle analysis"
  data={chartData}
  options={chartOptions}
  type="line"
/>

// Recharts example
<RechartsWrapper
  title="Multi-Individual Analysis"
  subtitle="Comparison across participants"
>
  <LineChart data={data}>
    <Line dataKey="value" stroke="#0066CC" />
    <XAxis dataKey="time" />
    <YAxis />
  </LineChart>
</RechartsWrapper>
```

### 2. Manual Theme Application

For custom plot configurations, use the `applyPlotTheme` function:

```jsx
import { applyPlotTheme, CLColors } from './plotTheme';

const myPlotConfig = {
  data: [...],
  layout: {
    title: "My Plot",
    xaxis: { title: "Time" },
    yaxis: { title: "Value" }
  }
};

const themedConfig = applyPlotTheme(myPlotConfig, 'plotly');
```

### 3. Direct Color Usage

Use the CL colors directly in your plot configurations:

```jsx
import { CLColors } from './plotTheme';

const plotConfig = {
  data: [{
    x: timeData,
    y: valueData,
    line: { color: CLColors.secondary },
    marker: { color: CLColors.secondary }
  }],
  layout: {
    paper_bgcolor: CLColors.background,
    plot_bgcolor: CLColors.background,
    font: { color: CLColors.text }
  }
};
```

## Backend Implementation (Python)

### 1. Basic Setup

Import and initialize the CL theme:

```python
from plot_config import setup_CL_theme, create_CL_figure

# Initialize theme
setup_CL_theme()

# Create a figure with CL styling
fig, ax = create_CL_figure(figsize=(10, 6))
```

### 2. Creating Plots

```python
import numpy as np
from plot_config import style_CL_plot, save_CL_plot

# Create data
x = np.linspace(0, 24, 100)
y = np.sin(2 * np.pi * x / 24) * np.exp(-x/48)

# Create plot
fig, ax = create_CL_figure(figsize=(12, 8))
ax.plot(x, y, color='#0066CC', linewidth=2.5)

# Apply styling
style_CL_plot(
    fig, ax,
    title="Circadian Rhythm Analysis",
    xlabel="Time (hours)",
    ylabel="Amplitude",
    show_grid=True
)

# Save plot
save_CL_plot(fig, "circadian_analysis.png")
```

### 3. Seaborn Integration

```python
import seaborn as sns
from plot_config import setup_seaborn_CL_theme

# Setup Seaborn with CL theme
setup_seaborn_CL_theme()

# Create Seaborn plot
sns.lineplot(data=df, x='time', y='value', color='#0066CC')
plt.title("Circadian Pattern", fontsize=16, fontweight=600, color='#1A1A1A')
plt.xlabel("Time", fontsize=12, fontweight=500, color='#1A1A1A')
plt.ylabel("Value", fontsize=12, fontweight=500, color='#1A1A1A')
```

## Integration with Existing Components

### 1. Update LabTab.js

If you have existing plot components in `LabTab.js`, wrap them with the appropriate wrapper:

```jsx
// Before
<Plot data={data} layout={layout} />

// After
<PlotlyWrapper
  title="Cosinor Analysis"
  subtitle="Circadian rhythm analysis results"
  data={data}
  layout={layout}
/>
```

### 2. Update API Responses

For plots generated on the backend, ensure your API returns plots with CL styling:

```python
# In your Flask/FastAPI endpoint
from plot_config import create_CL_figure, style_CL_plot

@app.route('/api/analysis/plot')
def generate_analysis_plot():
    # Create plot with CL theme
    fig, ax = create_CL_figure()
    
    # Add your plot data
    ax.plot(x_data, y_data, color='#0066CC')
    
    # Apply styling
    style_CL_plot(fig, ax, title="Analysis Results")
    
    # Save and return
    save_CL_plot(fig, "temp_plot.png")
    return send_file("temp_plot.png")
```

## Best Practices

### 1. Consistent Typography
- Use Inter font family for all text elements
- Primary text: 16px for titles, 12px for labels, 11px for ticks
- Secondary text: 12px for subtitles, 11px for legends

### 2. Color Usage
- Use CL blue (`#0066CC`) for primary data series
- Use deep black (`#1A1A1A`) for text and important elements
- Use light gray (`#E0E0E0`) for grids and borders
- Use the full color palette for multiple data series

### 3. Layout Guidelines
- Maintain consistent margins (60px left, 40px right, 60px top/bottom)
- Use subtle shadows and borders (4px border radius)
- Ensure adequate white space around plots

### 4. Accessibility
- Maintain high contrast ratios
- Use semantic colors (green for success, red for errors)
- Ensure text is readable at all sizes

## Example Implementations

### Line Plot (Cosinor Analysis)
```jsx
<PlotlyWrapper
  title="Cosinor Analysis Results"
  subtitle="Circadian rhythm parameters over time"
  data={[{
    x: timeData,
    y: amplitudeData,
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Amplitude',
    line: { color: '#0066CC', width: 2 },
    marker: { color: '#0066CC', size: 6 }
  }]}
  layout={{
    xaxis: { title: 'Time (hours)' },
    yaxis: { title: 'Amplitude' },
    showlegend: true
  }}
/>
```

### Bar Chart (Phase Analysis)
```jsx
<ChartJsWrapper
  title="Phase Distribution"
  subtitle="Peak timing across participants"
  type="bar"
  data={{
    labels: ['6AM', '12PM', '6PM', '12AM'],
    datasets: [{
      label: 'Participants',
      data: [15, 25, 18, 12],
      backgroundColor: '#0066CC',
      borderColor: '#0066CC'
    }]
  }}
/>
```

### Scatter Plot (Correlation Analysis)
```jsx
<RechartsWrapper
  title="Amplitude vs Phase Correlation"
  subtitle="Relationship between circadian parameters"
>
  <ScatterChart data={correlationData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
    <XAxis dataKey="amplitude" stroke="#666666" />
    <YAxis stroke="#666666" />
    <Scatter dataKey="phase" fill="#0066CC" />
  </ScatterChart>
</RechartsWrapper>
```

## Troubleshooting

### Common Issues

1. **Fonts not loading**: Ensure Inter font is included in your project
2. **Colors not applying**: Check that you're importing the theme correctly
3. **Plot sizing issues**: Use responsive containers and proper aspect ratios

### Debug Tips

1. Use browser dev tools to inspect plot elements
2. Check console for any theme-related errors
3. Verify color values match the CL palette exactly

## Migration Checklist

- [ ] Import plot theme files
- [ ] Update existing plot components to use wrappers
- [ ] Test all plot types with new theme
- [ ] Verify accessibility and contrast
- [ ] Update documentation and examples
- [ ] Test on different screen sizes
- [ ] Validate with design team

This implementation ensures all plots in your CosinorLab application maintain the professional, consistent appearance that aligns with CL's design standards. 
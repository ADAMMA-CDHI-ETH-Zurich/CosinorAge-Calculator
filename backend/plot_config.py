# CL-inspired plot configuration for Python backend
# This file contains theme configurations for matplotlib, seaborn, and other Python plotting libraries

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.colors import LinearSegmentedColormap
import seaborn as sns
import numpy as np

# CL color palette
CL_COLORS = {
    'primary': '#1A1A1A',      # Deep black
    'secondary': '#0066CC',    # CL blue
    'accent': '#666666',       # Medium gray
    'background': '#FFFFFF',   # White
    'grid': '#E0E0E0',         # Light gray for grids
    'text': '#1A1A1A',         # Primary text
    'text_secondary': '#666666', # Secondary text
    'success': '#2E7D32',      # Green
    'warning': '#ED6C02',      # Orange
    'error': '#D32F2F',        # Red
    'info': '#0288D1',         # Light blue
}

# Color palette for plots
CL_PALETTE = [
    CL_COLORS['primary'],
    CL_COLORS['secondary'],
    CL_COLORS['success'],
    CL_COLORS['warning'],
    CL_COLORS['error'],
    CL_COLORS['info'],
    CL_COLORS['accent'],
]

def setup_CL_theme():
    """
    Set up the CL theme for matplotlib plots
    """
    plt.style.use('default')
    
    # Configure matplotlib parameters
    plt.rcParams.update({
        # Figure settings
        'figure.facecolor': CL_COLORS['background'],
        'figure.edgecolor': CL_COLORS['background'],
        'figure.dpi': 100,
        
        # Axes settings
        'axes.facecolor': CL_COLORS['background'],
        'axes.edgecolor': CL_COLORS['grid'],
        'axes.linewidth': 1.0,
        'axes.labelcolor': CL_COLORS['text'],
        'axes.titlecolor': CL_COLORS['text'],
        'axes.titlesize': 14,
        'axes.labelsize': 12,
        'axes.titleweight': '600',
        'axes.labelweight': '500',
        
        # Tick settings
        'xtick.color': CL_COLORS['text_secondary'],
        'ytick.color': CL_COLORS['text_secondary'],
        'xtick.labelsize': 11,
        'ytick.labelsize': 11,
        'xtick.major.size': 4,
        'ytick.major.size': 4,
        'xtick.major.width': 1.0,
        'ytick.major.width': 1.0,
        'xtick.minor.size': 2,
        'ytick.minor.size': 2,
        
        # Grid settings
        'grid.color': CL_COLORS['grid'],
        'grid.alpha': 0.3,
        'grid.linewidth': 1.0,
        'grid.linestyle': '-',
        
        # Text settings
        'text.color': CL_COLORS['text'],
        'font.family': 'Inter, Roboto, Helvetica Neue, Arial, sans-serif',
        'font.size': 12,
        'font.weight': '400',
        
        # Legend settings
        'legend.fontsize': 11,
        'legend.frameon': True,
        'legend.framealpha': 1.0,
        'legend.facecolor': CL_COLORS['background'],
        'legend.edgecolor': CL_COLORS['grid'],
        'legend.borderpad': 0.5,
        'legend.labelspacing': 0.5,
        
        # Line settings
        'lines.linewidth': 2.0,
        'lines.markersize': 6,
        'lines.markeredgewidth': 1.0,
        
        # Patch settings
        'patch.linewidth': 1.0,
        'patch.facecolor': CL_COLORS['secondary'],
        'patch.edgecolor': CL_COLORS['secondary'],
        
        # Save settings
        'savefig.facecolor': CL_COLORS['background'],
        'savefig.edgecolor': CL_COLORS['background'],
        'savefig.dpi': 300,
        'savefig.bbox': 'tight',
        'savefig.pad_inches': 0.1,
    })

def create_CL_figure(figsize=(10, 6), dpi=100):
    """
    Create a figure with CL styling
    
    Args:
        figsize (tuple): Figure size (width, height)
        dpi (int): DPI for the figure
    
    Returns:
        matplotlib.figure.Figure: Configured figure
    """
    setup_CL_theme()
    fig, ax = plt.subplots(figsize=figsize, dpi=dpi)
    
    # Set background color
    ax.set_facecolor(CL_COLORS['background'])
    fig.patch.set_facecolor(CL_COLORS['background'])
    
    # Configure grid
    ax.grid(True, alpha=0.3, color=CL_COLORS['grid'], linewidth=1.0)
    
    # Configure spines
    for spine in ax.spines.values():
        spine.set_color(CL_COLORS['grid'])
        spine.set_linewidth(1.0)
    
    return fig, ax

def apply_CL_colors(ax, color_index=0):
    """
    Apply CL colors to plot elements
    
    Args:
        ax (matplotlib.axes.Axes): The axes to style
        color_index (int): Index of color from CL_PALETTE
    """
    color = CL_PALETTE[color_index % len(CL_PALETTE)]
    
    # Apply color to lines
    for line in ax.lines:
        line.set_color(color)
        line.set_linewidth(2.0)
    
    # Apply color to patches (bars, etc.)
    for patch in ax.patches:
        patch.set_facecolor(color)
        patch.set_edgecolor(color)
        patch.set_alpha(0.8)

def style_CL_plot(fig, ax, title=None, xlabel=None, ylabel=None, 
                       legend_title=None, show_grid=True):
    """
    Apply comprehensive CL styling to a plot
    
    Args:
        fig (matplotlib.figure.Figure): The figure
        ax (matplotlib.axes.Axes): The axes
        title (str): Plot title
        xlabel (str): X-axis label
        ylabel (str): Y-axis label
        legend_title (str): Legend title
        show_grid (bool): Whether to show grid
    """
    # Set title
    if title:
        ax.set_title(title, fontsize=16, fontweight=600, 
                    color=CL_COLORS['text'], pad=20)
    
    # Set labels
    if xlabel:
        ax.set_xlabel(xlabel, fontsize=12, fontweight=500, 
                     color=CL_COLORS['text'])
    if ylabel:
        ax.set_ylabel(ylabel, fontsize=12, fontweight=500, 
                     color=CL_COLORS['text'])
    
    # Configure grid
    if show_grid:
        ax.grid(True, alpha=0.3, color=CL_COLORS['grid'], linewidth=1.0)
    else:
        ax.grid(False)
    
    # Style ticks
    ax.tick_params(colors=CL_COLORS['text_secondary'], 
                  labelsize=11, width=1.0, length=4)
    
    # Style legend
    if ax.get_legend():
        legend = ax.get_legend()
        legend.set_title(legend_title, prop={'size': 11, 'weight': '500'})
        legend.get_frame().set_facecolor(CL_COLORS['background'])
        legend.get_frame().set_edgecolor(CL_COLORS['grid'])
        legend.get_frame().set_linewidth(1.0)
    
    # Adjust layout
    fig.tight_layout()

def create_CL_colormap():
    """
    Create a CL-inspired colormap
    
    Returns:
        matplotlib.colors.LinearSegmentedColormap: Custom colormap
    """
    colors = [CL_COLORS['background'], 
              CL_COLORS['secondary'], 
              CL_COLORS['primary']]
    return LinearSegmentedColormap.from_list('CL', colors, N=256)

def setup_seaborn_CL_theme():
    """
    Set up Seaborn with CL theme
    """
    # Set Seaborn style
    sns.set_theme(style="whitegrid")
    
    # Configure Seaborn parameters
    sns.set_palette(CL_PALETTE)
    
    # Set context
    sns.set_context("paper", font_scale=1.0, 
                   rc={"font.family": "Inter, Roboto, Helvetica Neue, Arial, sans-serif"})

def save_CL_plot(fig, filename, dpi=300, bbox_inches='tight'):
    """
    Save a plot with CL styling
    
    Args:
        fig (matplotlib.figure.Figure): The figure to save
        filename (str): Output filename
        dpi (int): DPI for saving
        bbox_inches (str): Bounding box setting
    """
    fig.savefig(filename, 
                dpi=dpi, 
                bbox_inches=bbox_inches, 
                facecolor=CL_COLORS['background'],
                edgecolor=CL_COLORS['background'],
                pad_inches=0.1)

# Example usage functions
def create_example_line_plot():
    """Create an example line plot with CL styling"""
    fig, ax = create_CL_figure(figsize=(10, 6))
    
    x = np.linspace(0, 10, 100)
    y = np.sin(x) * np.exp(-x/5)
    
    ax.plot(x, y, color=CL_COLORS['secondary'], linewidth=2.5)
    
    style_CL_plot(fig, ax, 
                       title="Example Line Plot", 
                       xlabel="Time", 
                       ylabel="Amplitude")
    
    return fig, ax

def create_example_bar_plot():
    """Create an example bar plot with CL styling"""
    fig, ax = create_CL_figure(figsize=(10, 6))
    
    categories = ['A', 'B', 'C', 'D', 'E']
    values = [23, 45, 56, 78, 32]
    
    bars = ax.bar(categories, values, 
                  color=CL_COLORS['secondary'], 
                  alpha=0.8, 
                  edgecolor=CL_COLORS['secondary'])
    
    style_CL_plot(fig, ax, 
                       title="Example Bar Plot", 
                       xlabel="Categories", 
                       ylabel="Values")
    
    return fig, ax

def create_example_scatter_plot():
    """Create an example scatter plot with CL styling"""
    fig, ax = create_CL_figure(figsize=(10, 6))
    
    np.random.seed(42)
    x = np.random.normal(0, 1, 100)
    y = np.random.normal(0, 1, 100)
    
    ax.scatter(x, y, 
               color=CL_COLORS['secondary'], 
               alpha=0.6, 
               s=50)
    
    style_CL_plot(fig, ax, 
                       title="Example Scatter Plot", 
                       xlabel="X Values", 
                       ylabel="Y Values")
    
    return fig, ax

# Initialize theme when module is imported
setup_CL_theme()
setup_seaborn_CL_theme()

if __name__ == "__main__":
    # Example usage
    print("CL plot theme configured successfully!")
    print("Available colors:", list(CL_COLORS.keys()))
    print("Color palette:", CL_PALETTE) 
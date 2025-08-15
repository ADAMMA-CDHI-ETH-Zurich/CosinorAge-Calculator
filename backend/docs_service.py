import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import re

# URLs for documentation (using ReadTheDocs URLs)
DOCS_URLS = {
    'dataloaders': 'https://cosinorage.readthedocs.io/en/latest/cosinorage.datahandlers.html',
    'features': 'https://cosinorage.readthedocs.io/en/latest/cosinorage.features.html',
    'bioages': 'https://cosinorage.readthedocs.io/en/latest/cosinorage.bioages.html'
}

# Fallback static content if live fetching fails
FALLBACK_CONTENT = {
    'dataloaders': """
<div class="section">
<h1>cosinorage.datahandlers Module</h1>
<p>This module provides functionality to load accelerometer data or minute-level ENMO data from CSV files and process this data to obtain a dataframe containing minute-level ENMO data.</p>

<h2>Classes</h2>
<div class="section">
<h3>DataHandler</h3>
<p>A base class for data handlers that process and store ENMO data at the minute level.</p>
<dl>
<dt>Attributes:</dt>
<dd>datasource, input_path, preprocess, sf_data, acc_freq, meta_dict, ml_data</dd>
<dt>Methods:</dt>
<dd>save_data(), get_raw_data(), get_sf_data(), get_ml_data(), get_meta_data()</dd>
</dl>
</div>

<div class="section">
<h3>GalaxyDataHandler</h3>
<p>Data handler for Samsung Galaxy Watch accelerometer data.</p>
<dl>
<dt>Parameters:</dt>
<dd>galaxy_file_dir, preprocess_args, verbose</dd>
</dl>
</div>

<h2>Utility Functions</h2>
<ul>
<li>read_galaxy_data() - Read accelerometer data from Galaxy Watch binary files</li>
<li>filter_galaxy_data() - Filter Galaxy Watch accelerometer data</li>
<li>resample_galaxy_data() - Resample Galaxy Watch accelerometer data to minute-level</li>
<li>calculate_enmo() - Calculate the Euclidean Norm Minus One (ENMO) metric</li>
<li>calculate_minute_level_enmo() - Resample high-frequency ENMO data to minute-level</li>
</ul>
</div>
""",
    'features': """
<div class="section">
<h1>cosinorage.features Module</h1>
<p>This module provides comprehensive feature extraction capabilities for accelerometer data analysis.</p>

<h2>Classes</h2>
<div class="section">
<h3>WearableFeatures</h3>
<p>Main class for extracting features from accelerometer data.</p>
<dl>
<dt>Parameters:</dt>
<dd>sleep_rescore, sleep_ck_sf, pa_cutpoint_sl, pa_cutpoint_lm, pa_cutpoint_mv</dd>
<dt>Methods:</dt>
<dd>extract_features(), extract_cosinor_features(), extract_nonparametric_features(), extract_physical_activity_features(), extract_sleep_features()</dd>
</dl>
</div>

<h2>Feature Types</h2>
<h3>Cosinor Analysis Features</h3>
<ul>
<li>mesor - The mean value of the fitted cosine curve</li>
<li>amplitude - Half the difference between peak and trough</li>
<li>acrophase - Timing of the peak of the fitted cosine curve</li>
<li>acrophase_time - Time of day when peak occurs</li>
</ul>

<h3>Non-parametric Features</h3>
<ul>
<li>IS (Interdaily Stability) - Consistency of activity patterns between days</li>
<li>IV (Intradaily Variability) - Fragmentation of activity within a day</li>
<li>RA (Relative Amplitude) - Difference between M10 and L5 periods</li>
<li>M10 - Mean activity during 10 most active hours</li>
<li>L5 - Mean activity during 5 least active hours</li>
</ul>
</div>
""",
    'bioages': """
<div class="section">
<h1>cosinorage.bioages Module</h1>
<p>This module provides biological age prediction capabilities based on accelerometer data analysis.</p>

<h2>Classes</h2>
<div class="section">
<h3>CosinorAge</h3>
<p>Main class for biological age prediction using cosinor analysis and machine learning models.</p>
<dl>
<dt>Parameters:</dt>
<dd>model_path, feature_scaler_path, verbose, model_type, confidence_level</dd>
<dt>Methods:</dt>
<dd>predict_age(), load_model(), preprocess_features(), get_prediction_confidence(), get_feature_importance()</dd>
</dl>
</div>

<h2>Prediction Process</h2>
<ol>
<li>Feature Extraction - Extract relevant features from accelerometer data</li>
<li>Feature Preprocessing - Scale and normalize features for model input</li>
<li>Model Prediction - Use trained machine learning models to predict biological age</li>
<li>Result Interpretation - Compare predicted biological age with chronological age</li>
</ol>

<h2>Model Types</h2>
<ul>
<li>Gender-specific models - Separate models for male and female participants</li>
<li>Gender-invariant models - Models trained on combined data</li>
<li>Ensemble models - Combinations of multiple models</li>
</ul>
</div>
"""
}

# Add module mapping after FALLBACK_CONTENT
module_mapping = {
    'cosinor_analysis': 'features/utils/cosinor_analysis.py',
    'nonparam_analysis': 'features/utils/nonparam_analysis.py',
    'physical_activity': 'features/utils/physical_activity.py',
    'physical_activity_metrics': 'features/utils/physical_activity_metrics.py',
    'sleep_analysis': 'features/utils/sleep_analysis.py',
    'wearable_features': 'features/wearable_features.py',
    'galaxydatahandler': 'datahandlers/galaxydatahandler.py',
    'nhanesdatahandler': 'datahandlers/nhanesdatahandler.py',
    'ukbdatahandler': 'datahandlers/ukbdatahandler.py',
    'ukb': 'datahandlers/utils/ukb.py',
    'nhanes': 'datahandlers/utils/nhanes.py',
    'galaxy': 'datahandlers/utils/galaxy.py',
    'generic': 'datahandlers/utils/generic.py',
    'genericdatahandler': 'datahandlers/genericdatahandler.py',
    'datahandler': 'datahandlers/datahandler.py',
    'cosinor_age': 'bioages/cosinor_age.py',
    'rescale': 'features/utils/rescale.py',
    'rescaling': 'features/utils/rescaling.py',
    'visualization': 'features/utils/visualization.py'
}

def extract_specific_sections(soup):
    """
    Extract only Module Contents, Classes, and Utility Functions sections from ReadTheDocs.
    """
    content = []
    
    print("Starting content extraction...")
    
    # Try multiple selectors to find the main content area
    main_content = None
    selectors = [
        'div.body',
        'div.document', 
        'div#content',
        'main',
        'article',
        'div[role="main"]'
    ]
    
    for selector in selectors:
        main_content = soup.select_one(selector)
        if main_content:
            print(f"Found main content with selector: {selector}")
            break
    
    if not main_content:
        print("No main content found with any selector")
        # Try to find any content with h1 tags
        h1_tags = soup.find_all('h1')
        if h1_tags:
            print(f"Found {len(h1_tags)} h1 tags, using the first one as starting point")
            main_content = h1_tags[0].parent
        else:
            return None
    
    # Extract the main heading
    main_heading = main_content.find('h1')
    if main_heading:
        content.append(f'<h1>{main_heading.get_text()}</h1>')
        print(f"Added main heading: {main_heading.get_text()}")
    
    # Find all h2 headers to see what sections are available
    h2_headers = main_content.find_all('h2')
    print(f"Found {len(h2_headers)} h2 headers:")
    for h2 in h2_headers:
        print(f"  - {h2.get_text()}")
    
    # Find and extract Module Contents section
    module_contents_section = None
    for section in main_content.find_all(['div', 'section']):
        if section.find('h2') and 'Module Contents' in section.find('h2').get_text():
            module_contents_section = section
            break
    
    if module_contents_section:
        content.append('<h2>Module Contents</h2>')
        # Get the paragraph after the heading
        module_desc = module_contents_section.find('p')
        if module_desc:
            content.append(f'<p>{module_desc.get_text()}</p>')
            print("Added Module Contents section")
    else:
        print("Module Contents section not found")
    
    # Find and extract Classes section
    classes_section = None
    for section in main_content.find_all(['div', 'section']):
        if section.find('h2') and 'Classes' in section.find('h2').get_text():
            classes_section = section
            break
    
    if classes_section:
        content.append('<h2>Classes</h2>')
        print("Found Classes section, extracting content...")
        
        # Get all content in the classes section
        classes_content = classes_section.find_all(['div', 'dl', 'p', 'ul', 'ol', 'h3', 'h4'])
        for elem in classes_content:
            # Skip if it's a child of another element we're already including
            if not elem.find_parent(['div', 'dl'], class_=lambda x: x and 'class' in x.lower() if x else False):
                content.append(str(elem))
        
        print(f"Added {len(classes_content)} elements from Classes section")
    else:
        print("Classes section not found")
    
    # Find and extract Utility Functions section
    utility_section = None
    for section in main_content.find_all(['div', 'section']):
        if section.find('h2') and 'Utility Functions' in section.find('h2').get_text():
            utility_section = section
            break
    
    if utility_section:
        content.append('<h2>Utility Functions</h2>')
        print("Found Utility Functions section, extracting content...")
        
        # Get all content in the utility section
        utility_content = utility_section.find_all(['div', 'dl', 'h3', 'h4', 'p', 'ul', 'ol'])
        for elem in utility_content:
            # Skip if it's a child of another element we're already including
            if not elem.find_parent(['div', 'dl'], class_=lambda x: x and 'function' in x.lower() if x else False):
                content.append(str(elem))
        
        print(f"Added {len(utility_content)} elements from Utility Functions section")
    else:
        print("Utility Functions section not found")
    
    result = '\n'.join(content) if content else None
    print(f"Extraction complete. Content length: {len(result) if result else 0}")
    return result

def clean_html_content(html_content, current_module=None):
    """
    Clean up the HTML content for better display while preserving ReadTheDocs styling.
    """
    # Parse the content
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove navigation elements
    for element in soup.find_all(['nav', 'header', 'footer', 'script', 'style']):
        element.decompose()
    
    # Remove Sphinx-specific navigation elements
    for element in soup.find_all(['div'], class_=lambda x: x and any(keyword in x.lower() for keyword in ['sphinx', 'sidebar', 'navigation', 'toc'])):
        element.decompose()
    
    # Clean up links to internal references but keep external links and source links
    for link in soup.find_all('a'):
        href = link.get('href')
        text = link.get_text()
        
        if href and ('[source]' in text or 'source' in text.lower()):
            # Ensure source links open in new tab
            link['target'] = '_blank'
            link['rel'] = 'noopener noreferrer'
            
            # Extract module name from href
            module_name = None
            if href.startswith('_modules/'):
                module_name = href.split('/')[-1].replace('.html', '').replace('.rst', '')
                if '#' in module_name:
                    module_name = module_name.split('#')[0]
            elif href.startswith('_sources/'):
                module_name = href.split('/')[-1].replace('.html', '').replace('.rst', '')
                if '#' in module_name:
                    module_name = module_name.split('#')[0]
            
            if module_name:
                # Convert to snake_case for matching
                module_name = module_name.lower().replace('.', '_')
                
                # Try to find the correct file path
                file_path = None
                if module_name in module_mapping:
                    file_path = module_mapping[module_name]
                else:
                    # For utility functions, try the appropriate utils subdirectory based on context
                    utility_keywords = ['filter', 'calc', 'plot', 'math', 'file', 'sleep', 'enmo', 'util', 'helper']
                    if any(keyword in module_name.lower() for keyword in utility_keywords):
                        if current_module == 'features':
                            file_path = f'features/utils/{module_name}.py'
                        elif current_module == 'bioages':
                            file_path = f'bioages/utils/{module_name}.py'
                        else:
                            file_path = f'datahandlers/utils/{module_name}.py'
                    else:
                        # Default fallback - try to guess the module type
                        if 'feature' in module_name:
                            file_path = f'features/{module_name}.py'
                        elif 'age' in module_name or 'bio' in module_name:
                            file_path = f'bioages/{module_name}.py'
                        else:
                            file_path = f'datahandlers/{module_name}.py'
                
                # Update the link href
                if file_path:
                    link['href'] = f'https://github.com/ADAMMA-CDHI-ETH-Zurich/CosinorAge/blob/main/cosinorage/{file_path}'
                else:
                    # If we can't determine the path, make it a placeholder
                    link['href'] = '#'
                    link['onclick'] = 'alert("Source link not available. This would typically link to the GitHub source code.")'
        elif href and href.startswith('#'):
            # Convert internal links to plain text
            link.unwrap()
    
    # Remove paragraph markers
    for element in soup.find_all(text=True):
        if '¶' in element:
            element.replace_with(element.replace('¶', ''))
    
    # Enhance code blocks for better syntax highlighting
    for code_block in soup.find_all(['pre', 'code']):
        # Ensure code blocks have proper classes for syntax highlighting
        if code_block.name == 'pre':
            # Add highlight class if not present
            if not code_block.get('class'):
                code_block['class'] = ['highlight']
            elif 'highlight' not in code_block.get('class', []):
                code_block['class'].append('highlight')
        
        # Ensure inline code has proper styling
        elif code_block.name == 'code' and not code_block.find_parent('pre'):
            if not code_block.get('class'):
                code_block['class'] = ['code-inline']
    
    # Add wrapper divs for better styling
    for section in soup.find_all(['div', 'section']):
        if section.find('h2') and not section.get('class'):
            section['class'] = ['section']
    
    # Enhance definition lists for better styling
    for dl in soup.find_all('dl'):
        if not dl.get('class'):
            dl['class'] = ['definition-list']
    
    # Enhance tables for better styling
    for table in soup.find_all('table'):
        if not table.get('class'):
            table['class'] = ['table']
    
    # Preserve ReadTheDocs styling classes and return
    return str(soup)

def fetch_documentation(module: str):
    """
    Fetch documentation from ReadTheDocs for a specific module and extract only relevant sections.
    """
    if module not in DOCS_URLS:
        raise HTTPException(status_code=404, detail=f"Documentation for module {module} not found")
    
    try:
        print(f"Attempting to fetch live documentation for {module} from {DOCS_URLS[module]}")
        
        # Try to fetch live documentation with a timeout
        response = requests.get(DOCS_URLS[module], timeout=10)
        response.raise_for_status()
        
        print(f"Successfully fetched {len(response.text)} characters for {module}")
        
        # Parse HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract only the relevant sections
        content = extract_specific_sections(soup)
        
        if content and len(content.strip()) > 100:  # Make sure we have substantial content
            print(f"Successfully extracted content for {module}")
            # Clean up the content while preserving ReadTheDocs styling
            cleaned_content = clean_html_content(content, module)
            return cleaned_content
        else:
            print(f"Failed to extract sufficient content for {module}, using fallback")
            # If extraction failed, return fallback content
            return FALLBACK_CONTENT[module]
        
    except requests.RequestException as e:
        print(f"Failed to fetch live documentation for {module}: {str(e)}")
        # Return fallback content if live fetching fails
        return FALLBACK_CONTENT[module]
    except Exception as e:
        print(f"Error processing documentation for {module}: {str(e)}")
        # Return fallback content if processing fails
        return FALLBACK_CONTENT[module]

# Add routes to main.py FastAPI app
def setup_docs_routes(app: FastAPI):
    @app.get("/docs/{module}")
    async def get_documentation(module: str):
        """
        Get documentation for a specific module.
        """
        return {"content": fetch_documentation(module)} 
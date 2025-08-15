import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { Code as CodeIcon } from "@mui/icons-material";
import config from "../../config";

function APIDocumentationSubTab() {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("apiDocumentationActiveTab");
    return savedTab || "dataloaders";
  });
  const [documentation, setDocumentation] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save activeTab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("apiDocumentationActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const fetchDocumentation = async (module) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(config.getApiUrl(`docs/${module}`));
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || `Failed to fetch ${module} documentation`
          );
        }
        const data = await response.json();
        setDocumentation((prev) => ({
          ...prev,
          [module]: data.content,
        }));
      } catch (err) {
        console.error("Documentation fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentation(activeTab);
  }, [activeTab]);

  // Handle [source] link styling after content is rendered
  useEffect(() => {
    if (documentation[activeTab]) {
      // Wait for DOM to be updated
      setTimeout(() => {
        const container = document.querySelector(
          "[data-api-documentation-content]"
        );
        if (container) {
          // Hide Module Contents section
          const moduleContentsHeading = Array.from(container.querySelectorAll("h2")).find(h2 => 
            h2.textContent.includes("Module Contents")
          );
          if (moduleContentsHeading) {
            moduleContentsHeading.style.display = "none";
            
            // Also hide the paragraph that follows the Module Contents heading
            const nextParagraph = moduleContentsHeading.nextElementSibling;
            if (nextParagraph && nextParagraph.tagName === "P") {
              nextParagraph.style.display = "none";
            }
          }
          
          // Style h3 elements in Utility Functions section to look like smaller headings with dashed lines
          const utilityFunctionsHeading = Array.from(container.querySelectorAll("h2")).find(h2 => 
            h2.textContent.includes("Utility Functions")
          );
          if (utilityFunctionsHeading) {
            const utilitySection = utilityFunctionsHeading.parentElement;
            const h3Elements = utilitySection.querySelectorAll("h3");
            
            h3Elements.forEach(h3 => {
              h3.style.cssText = `
                font-size: 1.2rem;
                font-weight: 700;
                color: #2c3e50;
                margin: 24px 0 12px 0;
                padding-bottom: 8px;
                border-bottom: 2px dashed #bdc3c7;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              `;
            });
          }
          
          // Create metallic header for module title and description
          const h1 = container.querySelector("h1");
          const firstP = container.querySelector("p");
          
          if (h1 && firstP) {
            // Create the header container with dark grey background and white text
            const headerContainer = document.createElement("div");
            headerContainer.style.cssText = `
              background: #2D2D2D;
              border: 1px solid #1A1A1A;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 24px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              position: relative;
              overflow: hidden;
            `;
            
            // Create the header line with icon and title
            const headerLine = document.createElement("div");
            headerLine.style.cssText = `
              display: flex;
              align-items: center;
              margin-bottom: 16px;
              gap: 12px;
            `;
            
            // Create the code icon
            const iconContainer = document.createElement("div");
            iconContainer.style.cssText = `
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            `;
            
            // Add the code icon SVG
            iconContainer.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z" fill="white"/>
              </svg>
            `;
            
            // Style the title
            const title = h1.cloneNode(true);
            title.style.cssText = `
              font-size: 1.5rem;
              font-weight: 700;
              margin: 0;
              color: white;
              line-height: 1.2;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            // Style the description
            const description = firstP.cloneNode(true);
            description.style.cssText = `
              font-size: 1rem;
              line-height: 1.6;
              margin: 0;
              color: rgba(255, 255, 255, 0.9);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            `;
            
            // Assemble the header
            headerLine.appendChild(iconContainer);
            headerLine.appendChild(title);
            headerContainer.appendChild(headerLine);
            headerContainer.appendChild(description);
            
            // Insert the header before the original content
            container.insertBefore(headerContainer, container.firstChild);
            
            // Hide the original h1 and p
            h1.style.display = "none";
            firstP.style.display = "none";
          }
          
          const sourceLinks = container.querySelectorAll("a");
          console.log(
            `Found ${sourceLinks.length} total links in API documentation`
          );

          sourceLinks.forEach((link, index) => {
            const linkText = link.textContent;
            const linkHref = link.getAttribute("href");

            console.log(`Link ${index}: "${linkText}" -> ${linkHref}`);

            if (linkText.includes("[source]")) {
              console.log(
                `Processing source link: "${linkText}" -> ${linkHref}`
              );

              // Apply styling
              link.style.float = "right";
              link.style.fontSize = "0.8em";
              link.style.color = "#6c757d";
              link.style.textDecoration = "none";
              link.style.marginLeft = "1rem";
              link.style.cursor = "pointer";

              // Ensure the link opens in new tab if it has a valid href
              if (
                linkHref &&
                typeof linkHref === "string" &&
                !linkHref.startsWith("#") &&
                !linkHref.startsWith("javascript:")
              ) {
                link.setAttribute("target", "_blank");
                link.setAttribute("rel", "noopener noreferrer");
                console.log(`Source link will open: ${linkHref}`);
              } else if (
                !linkHref ||
                (typeof linkHref === "string" &&
                  (linkHref.startsWith("#") ||
                    linkHref.startsWith("javascript:")))
              ) {
                console.warn(`Source link has invalid href: ${linkHref}`);
                // Make it a placeholder link for now
                link.href = "#";
                link.onclick = (e) => {
                  e.preventDefault();
                  alert(
                    "Source link not available. This would typically link to the GitHub source code."
                  );
                };
              }
            }
          });
        }
      }, 100);
    }
  }, [documentation, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: "1rem",
          },
        }}
      >
        <Tab label="Data Handlers" value="dataloaders" />
        <Tab label="Features" value="features" />
        <Tab label="Biological Ages" value="bioages" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <Box
          sx={{
            "& .section": {
              mb: 4,
              backgroundColor: "#ffffff",
              borderRadius: 2,
              padding: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              border: "1px solid #e0e0e0",
            },
            "& h1": {
              fontSize: "2rem",
              fontWeight: 700,
              color: "primary.main",
              mb: 2,
            },
            "& h2": {
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "text.primary",
              mt: 4,
              mb: 2,
              borderBottom: "2px solid",
              borderColor: "primary.main",
              paddingBottom: "0.5rem",
            },
            "& h3": {
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "primary.main",
              mt: 3,
              mb: 2,
              backgroundColor: "transparent",
              color: "#2c3e50",
              padding: "0",
              borderRadius: "0",
              display: "block",
            },
            "& h4": {
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "text.primary",
              mt: 2,
              mb: 1,
            },
            "& p": {
              mb: 2,
              lineHeight: 1.6,
              fontSize: "1rem",
            },
            "& ul, & ol": {
              pl: 3,
              mb: 2,
              "& li": {
                mb: 0.5,
                lineHeight: 1.5,
              },
            },
            "& li": {
              mb: 1,
            },
            "& strong": {
              fontWeight: 600,
              color: "text.primary",
            },
            "& code": {
              backgroundColor: "#f8f9fa",
              padding: "3px 6px",
              borderRadius: 4,
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
              fontSize: "0.9em",
              color: "#e74c3c",
              border: "1px solid #e9ecef",
              fontWeight: "500",
            },
            "& .highlight": {
              backgroundColor: "#2d3748",
              padding: "1.5rem",
              borderRadius: 4,
              mb: 2,
              overflowX: "auto",
              border: "1px solid #4a5568",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            },
            "& .highlight pre": {
              margin: 0,
              fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
              fontSize: "0.9em",
              lineHeight: 1.5,
              color: "#e2e8f0",
            },
            "& .highlight .hll": { backgroundColor: "#744210" },
            "& .highlight .c": { color: "#68d391", fontStyle: "italic" }, // Comment
            "& .highlight .err": {
              color: "#fed7d7",
              backgroundColor: "#c53030",
            }, // Error
            "& .highlight .k": { color: "#90cdf4", fontWeight: "bold" }, // Keyword
            "& .highlight .o": { color: "#90cdf4", fontWeight: "bold" }, // Operator
            "& .highlight .ch": { color: "#68d391", fontStyle: "italic" }, // Comment.Hashbang
            "& .highlight .cm": { color: "#68d391", fontStyle: "italic" }, // Comment.Multiline
            "& .highlight .cp": {
              color: "#f6ad55",
              fontWeight: "bold",
              fontStyle: "italic",
            }, // Comment.Preproc
            "& .highlight .cpf": {
              color: "#68d391",
              fontStyle: "italic",
            }, // Comment.PreprocFile
            "& .highlight .c1": { color: "#68d391", fontStyle: "italic" }, // Comment.Single
            "& .highlight .cs": {
              color: "#f6ad55",
              fontWeight: "bold",
              fontStyle: "italic",
            }, // Comment.Special
            "& .highlight .gd": {
              color: "#fed7d7",
              backgroundColor: "#742a2a",
            }, // Generic.Deleted
            "& .highlight .ge": { color: "#fed7d7", fontStyle: "italic" }, // Generic.Emph
            "& .highlight .gr": { color: "#fed7d7" }, // Generic.Error
            "& .highlight .gh": { color: "#a0aec0" }, // Generic.Heading
            "& .highlight .gi": {
              color: "#c6f6d5",
              backgroundColor: "#22543d",
            }, // Generic.Inserted
            "& .highlight .go": { color: "#a0aec0" }, // Generic.Output
            "& .highlight .gp": { color: "#a0aec0" }, // Generic.Prompt
            "& .highlight .gs": { fontWeight: "bold" }, // Generic.Strong
            "& .highlight .gu": { color: "#a0aec0" }, // Generic.Subheading
            "& .highlight .gt": { color: "#fed7d7" }, // Generic.Traceback
            "& .highlight .kc": { color: "#90cdf4", fontWeight: "bold" }, // Keyword.Constant
            "& .highlight .kd": { color: "#90cdf4", fontWeight: "bold" }, // Keyword.Declaration
            "& .highlight .kn": { color: "#90cdf4", fontWeight: "bold" }, // Keyword.Namespace
            "& .highlight .kp": { color: "#90cdf4", fontWeight: "bold" }, // Keyword.Pseudo
            "& .highlight .kr": { color: "#90cdf4", fontWeight: "bold" }, // Keyword.Reserved
            "& .highlight .kt": { color: "#f6ad55", fontWeight: "bold" }, // Keyword.Type
            "& .highlight .m": { color: "#81e6d9" }, // Literal.Number
            "& .highlight .s": { color: "#feb2b2" }, // Literal.String
            "& .highlight .na": { color: "#81e6d9" }, // Name.Attribute
            "& .highlight .nb": { color: "#90cdf4" }, // Name.Builtin
            "& .highlight .nc": { color: "#f6ad55", fontWeight: "bold" }, // Name.Class
            "& .highlight .no": { color: "#81e6d9" }, // Name.Constant
            "& .highlight .nd": { color: "#90cdf4", fontWeight: "bold" }, // Name.Decorator
            "& .highlight .ni": { color: "#d6bcfa" }, // Name.Entity
            "& .highlight .ne": { color: "#fed7d7", fontWeight: "bold" }, // Name.Exception
            "& .highlight .nf": { color: "#90cdf4", fontWeight: "bold" }, // Name.Function
            "& .highlight .nl": { color: "#90cdf4", fontWeight: "bold" }, // Name.Label
            "& .highlight .nn": { color: "#a0aec0" }, // Name.Namespace
            "& .highlight .nt": { color: "#90cdf4" }, // Name.Tag
            "& .highlight .nv": { color: "#81e6d9" }, // Name.Variable
            "& .highlight .ow": { color: "#90cdf4", fontWeight: "bold" }, // Operator.Word
            "& .highlight .w": { color: "#a0aec0" }, // Text.Whitespace
            "& .highlight .mb": { color: "#81e6d9" }, // Literal.Number.Bin
            "& .highlight .mf": { color: "#81e6d9" }, // Literal.Number.Float
            "& .highlight .mh": { color: "#81e6d9" }, // Literal.Number.Hex
            "& .highlight .mi": { color: "#81e6d9" }, // Literal.Number.Integer
            "& .highlight .mo": { color: "#81e6d9" }, // Literal.Number.Oct
            "& .highlight .sa": { color: "#feb2b2" }, // Literal.String.Affix
            "& .highlight .sb": { color: "#feb2b2" }, // Literal.String.Backtick
            "& .highlight .sc": { color: "#feb2b2" }, // Literal.String.Char
            "& .highlight .dl": { color: "#feb2b2" }, // Literal.String.Delimiter
            "& .highlight .sd": { color: "#feb2b2" }, // Literal.String.Doc
            "& .highlight .s2": { color: "#feb2b2" }, // Literal.String.Double
            "& .highlight .se": { color: "#feb2b2" }, // Literal.String.Escape
            "& .highlight .sh": { color: "#feb2b2" }, // Literal.String.Heredoc
            "& .highlight .si": { color: "#feb2b2" }, // Literal.String.Interpol
            "& .highlight .sx": { color: "#feb2b2" }, // Literal.String.Other
            "& .highlight .sr": { color: "#68d391" }, // Literal.String.Regex
            "& .highlight .s1": { color: "#feb2b2" }, // Literal.String.Single
            "& .highlight .ss": { color: "#d6bcfa" }, // Literal.String.Symbol
            "& .highlight .bp": { color: "#a0aec0" }, // Name.Builtin.Pseudo
            "& .highlight .fm": { color: "#90cdf4", fontWeight: "bold" }, // Name.Function.Magic
            "& .highlight .vc": { color: "#81e6d9" }, // Name.Variable.Class
            "& .highlight .vg": { color: "#81e6d9" }, // Name.Variable.Global
            "& .highlight .vi": { color: "#81e6d9" }, // Name.Variable.Instance
            "& .highlight .vm": { color: "#81e6d9" }, // Name.Variable.Magic
            "& .highlight .il": { color: "#81e6d9" }, // Literal.Number.Integer.Long
            "& dl": {
              mb: 2,
              backgroundColor: "#f8f9fa",
              padding: "1rem",
              borderRadius: 1,
              border: "1px solid #e9ecef",
            },
            "& dt": {
              fontWeight: 600,
              color: "primary.main",
              mb: 1,
              fontSize: "1rem",
            },
            "& dd": {
              ml: 2,
              mb: 2,
              color: "text.secondary",
            },
            "& .definition-list": {
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              padding: "1rem",
              backgroundColor: "#fafafa",
              mb: 2,
            },
            "& .definition-list dt": {
              fontWeight: 700,
              color: "primary.main",
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: "0.5rem",
              marginBottom: "0.5rem",
            },
            "& .definition-list dd": {
              marginLeft: 0,
              paddingLeft: "1rem",
              borderLeft: "3px solid #e0e0e0",
            },
            "& .code-inline": {
              backgroundColor: "grey.100",
              padding: "2px 4px",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.9em",
              color: "#d63384",
            },
            "& table": {
              width: "100%",
              borderCollapse: "collapse",
              mb: 2,
              borderRadius: 1,
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
            "& th, & td": {
              border: "1px solid #ddd",
              padding: "0.75rem",
              textAlign: "left",
            },
            "& th": {
              backgroundColor: "primary.main",
              color: "white",
              fontWeight: 600,
            },
            "& .table": {
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: 1,
              overflow: "hidden",
              "& th": {
                backgroundColor: "primary.main",
                color: "white",
                fontWeight: 600,
              },
              "& tr:nth-of-type(even)": {
                backgroundColor: "#f8f9fa",
              },
              "& tr:hover": {
                backgroundColor: "#f0f0f0",
              },
            },
            "& .section": {
              marginBottom: "2rem",
              padding: "1rem",
              backgroundColor: "#ffffff",
              borderRadius: 1,
              border: "1px solid #e0e0e0",
              "& h2": {
                borderBottom: "2px solid primary.main",
                paddingBottom: "0.5rem",
                marginBottom: "1rem",
              },
              "& h3": {
                color: "primary.main",
                borderLeft: "4px solid primary.main",
                paddingLeft: "1rem",
              },
            },
            "& .admonition": {
              margin: "1em 0",
              padding: "1em",
              borderLeft: "4px solid",
              backgroundColor: "#f8f9fa",
              "&.note": {
                borderColor: "#007bff",
                "& .admonition-title": {
                  color: "#007bff",
                },
              },
              "&.warning": {
                borderColor: "#ffc107",
                "& .admonition-title": {
                  color: "#856404",
                },
              },
              "&.important": {
                borderColor: "#dc3545",
                "& .admonition-title": {
                  color: "#dc3545",
                },
              },
            },
            "& .admonition-title": {
              marginTop: 0,
              marginBottom: "0.5em",
              fontWeight: 600,
            },
            "& .code-inline": {
              backgroundColor: "grey.100",
              padding: "2px 4px",
              borderRadius: 1,
              fontFamily: "monospace",
              fontSize: "0.9em",
              color: "#d63384",
            },
            "& .definition-list": {
              mb: 2,
            },
            "& .table": {
              width: "100%",
              borderCollapse: "collapse",
              mb: 2,
            },
            "& .section": {
              mb: 4,
            },
          }}
          data-api-documentation-content
          dangerouslySetInnerHTML={{
            __html:
              documentation[activeTab] ||
              "<p>No documentation available for this module.</p>",
          }}
        />
      )}
    </Box>
  );
}

export default APIDocumentationSubTab;

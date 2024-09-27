#!/bin/bash

set -e

# Configuration
OUTPUT_DIR="documentation"
OUTPUT_FILE="$OUTPUT_DIR/project_overview.md"
MAX_FILE_SIZE_KB=1000
EXCLUDE_DIRS=(".git" "node_modules" "venv" "__pycache__" "$OUTPUT_DIR")
EXCLUDE_FILES=("create_project_md.sh")

# Create the output directory
mkdir -p "$OUTPUT_DIR"

# Function to escape special characters for Markdown code blocks
escape_markdown() {
    sed 's/```/\\`\\`\\`/g'
}

# Function to determine the language for syntax highlighting
get_language() {
    case "$1" in
        py) echo "python" ;;
        js) echo "javascript" ;;
        html) echo "html" ;;
        css) echo "css" ;;
        sh) echo "bash" ;;
        md) echo "markdown" ;;
        json) echo "json" ;;
        yml|yaml) echo "yaml" ;;
        Dockerfile) echo "dockerfile" ;;
        *) echo "plaintext" ;;
    esac
}

# Function to check if a file should be excluded
should_exclude() {
    local file="$1"
    
    # Check if file is in EXCLUDE_FILES
    for exclude in "${EXCLUDE_FILES[@]}"; do
        [[ "$(basename "$file")" == "$exclude" ]] && return 0
    done
    
    # Check if file is in an excluded directory
    for dir in "${EXCLUDE_DIRS[@]}"; do
        [[ "$file" == *"/$dir/"* || "$file" == *"$dir/"* ]] && return 0
    done
    
    # Check file size
    local size=$(du -k "$file" | cut -f1)
    [[ $size -gt $MAX_FILE_SIZE_KB ]] && return 0
    
    return 1
}

# Create or overwrite the Markdown file
echo "# Project Code Overview" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "## Table of Contents" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Generate table of contents
find . -type f -not -path '*/\.*' | sort | while read -r file; do
    if ! should_exclude "$file"; then
        echo "- [$file](#file-${file//[^a-zA-Z0-9]/-})" >> "$OUTPUT_FILE"
    fi
done

echo "" >> "$OUTPUT_FILE"

# Loop through all files in the current directory and subdirectories
find . -type f -not -path '*/\.*' | sort | while read -r file; do
    if ! should_exclude "$file"; then
        echo "## File: $file {#file-${file//[^a-zA-Z0-9]/-}}" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        
        # Determine the language for syntax highlighting
        extension="${file##*.}"
        if [[ "$extension" == "$file" ]]; then
            extension="${file#.}"
        fi
        language=$(get_language "$extension")
        
        echo '```'"$language" >> "$OUTPUT_FILE"
        cat "$file" | escape_markdown >> "$OUTPUT_FILE"
        echo '```' >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

echo "Project overview Markdown file has been created: $OUTPUT_FILE"

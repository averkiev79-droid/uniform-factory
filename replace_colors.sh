#!/bin/bash

# Replace purple colors with navy colors in React components

echo "Replacing purple colors with navy..."

# Function to replace in files
replace_in_files() {
    find /app/frontend/src -name "*.jsx" -o -name "*.js" | while read file; do
        # Replace common purple classes with navy classes
        sed -i 's/bg-purple-600/bg-navy/g' "$file"
        sed -i 's/bg-purple-700/bg-navy-hover/g' "$file"
        sed -i 's/bg-purple-50/bg-navy-50/g' "$file"
        sed -i 's/bg-purple-100/bg-navy-100/g' "$file"
        sed -i 's/hover:bg-purple-600/hover:bg-navy/g' "$file"
        sed -i 's/hover:bg-purple-700/hover:bg-navy-hover/g' "$file"
        sed -i 's/hover:bg-purple-50/hover:bg-navy-50/g' "$file"
        
        sed -i 's/text-purple-600/text-navy/g' "$file"
        sed -i 's/text-purple-700/text-navy-700/g' "$file"
        sed -i 's/text-purple-100/text-navy-100/g' "$file"
        sed -i 's/text-purple-400/text-navy-400/g' "$file"
        sed -i 's/hover:text-purple-600/hover:text-navy/g' "$file"
        
        sed -i 's/border-purple-600/border-navy/g' "$file"
        sed -i 's/border-purple-500/border-navy-500/g' "$file"
        sed -i 's/border-purple-200/border-navy-200/g' "$file"
        sed -i 's/hover:border-purple-600/hover:border-navy/g' "$file"
        
        sed -i 's/focus:ring-purple-500/focus:ring-navy/g' "$file"
        sed -i 's/focus:border-purple/focus:border-navy/g' "$file"
        
        sed -i 's/from-purple-600/from-[#05296E]/g' "$file"
        
        echo "Processed: $file"
    done
}

replace_in_files

echo "Color replacement completed!"
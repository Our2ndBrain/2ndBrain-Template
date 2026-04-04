#!/bin/bash
#
# 2ndBrain Member Init Script
# Usage: ./99_System/Scripts/init_member.sh <member_name>
#

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Get project root directory
# Script is at 99_System/Scripts, need to go up two levels
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide member name${NC}"
    echo "Usage: $0 <member_name>"
    echo "Example: $0 alice"
    exit 1
fi

MEMBER_NAME="$1"
MEMBER_DIR="$PROJECT_ROOT/10_Inbox/$MEMBER_NAME"
TEMPLATE_DIR="$PROJECT_ROOT/99_System/Templates"
OBSIDIAN_CONFIG="$PROJECT_ROOT/.obsidian/daily-notes.json"

echo ""
echo "🧠 2ndBrain Member Init"
echo "========================"
echo "Member name: $MEMBER_NAME"
echo "Member directory: 10_Inbox/$MEMBER_NAME"
echo ""

# Check if member directory already exists
if [ -d "$MEMBER_DIR" ]; then
    echo -e "${YELLOW}⚠️  Directory 10_Inbox/$MEMBER_NAME already exists${NC}"
    read -p "Overwrite existing files? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled"
        exit 0
    fi
fi

# 1. Create member directory
echo -n "📁 Creating directory 10_Inbox/$MEMBER_NAME ... "
mkdir -p "$MEMBER_DIR"
echo -e "${GREEN}✓${NC}"

# 2. Copy personal dashboard template
echo -n "📋 Copying personal dashboard template ... "
if [ -f "$TEMPLATE_DIR/tpl_member_tasks.md" ]; then
    cp "$TEMPLATE_DIR/tpl_member_tasks.md" "$MEMBER_DIR/01_Tasks.md"
    # Replace placeholder with member name
    sed -i '' "s/{{MEMBER_NAME}}/$MEMBER_NAME/g" "$MEMBER_DIR/01_Tasks.md"
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Template file not found${NC}"
    exit 1
fi

# 3. Copy personal done records template
echo -n "✅ Copying personal done records template ... "
if [ -f "$TEMPLATE_DIR/tpl_member_done.md" ]; then
    cp "$TEMPLATE_DIR/tpl_member_done.md" "$MEMBER_DIR/09_Done.md"
    # Replace placeholder with member name
    sed -i '' "s/{{MEMBER_NAME}}/$MEMBER_NAME/g" "$MEMBER_DIR/09_Done.md"
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Template file not found${NC}"
    exit 1
fi

# 4. Update Obsidian daily-notes config
echo -n "⚙️  Configuring Obsidian daily-notes ... "

# Ensure .obsidian directory exists
mkdir -p "$PROJECT_ROOT/.obsidian"

# Create or update config file
cat > "$OBSIDIAN_CONFIG" << EOF
{
  "folder": "10_Inbox/$MEMBER_NAME",
  "autorun": true,
  "template": "99_System/Templates/tpl_daily_note"
}
EOF
echo -e "${GREEN}✓${NC}"

echo ""
echo "========================"
echo -e "${GREEN}🎉 Init complete!${NC}"
echo ""
echo "Created the following files:"
echo "  - 10_Inbox/$MEMBER_NAME/01_Tasks.md (personal dashboard)"
echo "  - 10_Inbox/$MEMBER_NAME/09_Done.md (done records)"
echo ""
echo "Next steps:"
echo "  1. Open this vault with Obsidian"
echo "  2. New daily notes will auto-save to 10_Inbox/$MEMBER_NAME/"
echo "  3. Start recording your first task!"
echo ""

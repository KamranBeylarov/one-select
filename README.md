# 🎯 OneSelect - jQuery Multi-Select Dropdown Component

**Version:** 1.2.0 | **Author:** Kamran Baylarov

A powerful, flexible, and feature-rich multi-select dropdown component for jQuery.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
4. [All Parameters](#all-parameters)
5. [Data Attributes](#data-attributes)
6. [Methods](#methods)
7. [Callbacks](#callbacks)
8. [Examples](#examples)
9. [AJAX Integration](#ajax-integration)
10. [Form Submission](#form-submission)
11. [Badge System](#badge-system)
12. [CSS Styling](#css-styling)

---

## 🎯 Overview

OneSelect is a powerful **jQuery-based** plugin that provides multi-select functionality with comprehensive customization options.

### 🚀 Key Features

- ✅ **Multiple Selection** - Select multiple items with checkboxes
- 🎯 **Select All** - Select all items with one click
- 🏷️️ **Badge System** - Display selected items as badges
- 📤 **External Badges** - Display badges in external elements
- 🔄 **AJAX Support** - Load data dynamically
- 🔍 **Search Feature** - Local filtering or AJAX search with debounce
- 📝 **Form Submission** - Submit data via hidden inputs
- 🎨 **Fully Customizable** - Complete control with 27+ parameters
- 📱 **Responsive** - Works on all devices
- 🌐 **Data Attributes** - Configure via HTML attributes
- 🎪 **Multiple Instances** - Independent selects on same page
- 🌪 **Click Outside** - Close dropdown when clicking outside (default: true)
- 📍 **Smart Positioning** - Dropdown positioned with `position: fixed` using viewport coordinates
- 🔀 **Horizontal Scroll Detection** - Automatically closes on any horizontal scroll to prevent misalignment

---

## 💡 Features

### 📊 Technical Stack

| Component | Technology |
|-----------|------------|
| **Library** | jQuery (required dependency) |
| **Plugin Type** | jQuery Plugin |
| **Files** | `one-select.js`, `one-select.min.css` |

### 🎯 Functionality

```
📦 Data Structures:
├── String Array: ['Apple', 'Banana', 'Cherry']
└── Object Array: [{id: 1, name: 'Apple'}, ...]

🎮 Interactions:
├── Click to select (checkbox)
├── "Select All" option
├── OK button (confirm)
├── Cancel button (clears selection and closes)
└── × button (remove from badges)

📤 Data Flow:
├── onChange(values, labels) - When selection changes
├── onOk(values, labels) - When OK clicked
├── onCancel() - When Cancel clicked
└── AJAX callbacks (beforeLoad, afterLoad, onLoadError)
```

---

## 📦 Installation

### Via NPM (Recommended)

```bash
npm install @kamranbaylarov/one-select
```

### Manual Download

Download from [GitHub Releases](https://github.com/KamranBeylarov/one-select/releases)

### Dependencies

```html
<!-- jQuery must be included first -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

### Include Files

**NPM:**
```html
<!-- CSS -->
<link rel="stylesheet" href="/node_modules/@kamranbaylarov/one-select/css/one-select.min.css">

<!-- JavaScript -->
<script src="/node_modules/@kamranbaylarov/one-select/js/one-select.min.js"></script>
```

**Manual:**
```html
<!-- CSS -->
<link rel="stylesheet" href="/path/to/one-select.min.css">

<!-- JavaScript -->
<script src="/path/to/one-select.js"></script>
```

### Create HTML Element

```html
<div id="mySelect"></div>
```

### Initialize

```javascript
$('#mySelect').oneSelect({
    data: ['Apple', 'Banana', 'Cherry']
});
```

---

## ⚙️ All Parameters

| Parameter | Type | Default | Description |
|---------|-----|---------|-------------|
| `placeholder` | String | `'Select options...'` | Placeholder text when nothing selected |
| `selectAllText` | String | `'Select All'` | "Select All" button text |
| `okText` | String | `'OK'` | OK button text |
| `cancelText` | String | `'Cancel'` | Cancel button text |
| `data` | Array/Object | `[]` | Options list (string array or key-value object) |
| `value` | Number/Array/String/null | `null` | Single index, key, or array to pre-select |
| `showCheckbox` | Boolean | `true` | Show/hide checkboxes |
| `showBadges` | Boolean | `false` | Show badges in trigger |
| `showBadgesExternal` | String/null | `null` | External element ID (for badges) |
| `showSearch` | Boolean | `false` | Show search input in dropdown |
| `searchPlaceholder` | String | `'Search...'` | Search input placeholder text |
| `searchUrl` | String/null | `null` | URL for AJAX search (GET request with `q` parameter) |
| `searchDebounceDelay` | Number | `300` | Delay in milliseconds for search debounce |
| `closeOnScroll` | Boolean | `false` | Close dropdown on page scroll |
| `closeOnOutside` | Boolean | `true` | Close dropdown when clicking outside |
| `submitForm` | Boolean | `false` | Submit form on OK click |
| `submitOnOutside` | Boolean | `false` | Submit form on outside click |
| `formId` | String/null | `null` | Specific form ID (null: parent form) |
| `name` | String/null | `null` | Hidden input name attribute |
| `multiple` | Boolean | `true` | Submit as array (name[]) |
| `ajax` | Object/null | `null` | AJAX configuration object |
| `autoLoad` | Boolean | `true` | Auto load data via AJAX |
| `beforeLoad` | Function/null | `null` | Called before AJAX |
| `afterLoad` | Function/null | `null` | Called after AJAX success |
| `onLoadError` | Function/null | `null` | Called on AJAX error |
| `onChange` | Function/null | `null` | Called when selection changes |
| `onSelect` | Function/null | `null` | Previous version of onChange |
| `onOk` | Function/null | `null` | Called when OK clicked |
| `onCancel` | Function/null | `null` | Called when Cancel clicked |

---

## 🏷️ Data Attributes

All parameters can be set via HTML data attributes. Data attributes **override JS parameters**.

| Data Attribute | Parameter | Type | Example |
|----------------|----------|-----|---------|
| `data-ones-placeholder` | `placeholder` | String | `data-ones-placeholder="Select..."` |
| `data-ones-select-all-text` | `selectAllText` | String | `data-ones-select-all-text="Select All"` |
| `data-ones-ok-text` | `okText` | String | `data-ones-ok-text="Confirm"` |
| `data-ones-cancel-text` | `cancelText` | String | `data-ones-cancel-text="Cancel"` |
| `data-ones-data` | `data` | Array | `data-ones-data='["A","B","C"]'` |
| `data-ones-value` | `value` | Number/Array | `data-ones-value='"0"'` or `data-ones-value='["0","2"]'` |
| `data-ones-name` | `name` | String | `data-ones-name="items"` |
| `data-ones-multiple` | `multiple` | Boolean | `data-ones-multiple="true"` |
| `data-ones-show-checkbox` | `showCheckbox` | Boolean | `data-ones-show-checkbox="false"` |
| `data-ones-show-badges` | `showBadges` | Boolean | `data-ones-show-badges="true"` |
| `data-ones-show-badges-external` | `showBadgesExternal` | String | `data-ones-show-badges-external="badgesDiv"` |
| `data-ones-show-search` | `showSearch` | Boolean | `data-ones-show-search="true"` |
| `data-ones-search-placeholder` | `searchPlaceholder` | String | `data-ones-search-placeholder="Search items..."` |
| `data-ones-search-url` | `searchUrl` | String | `data-ones-search-url="/api/search"` |
| `data-ones-search-debounce-delay` | `searchDebounceDelay` | Number | `data-ones-search-debounce-delay="500"` |
| `data-ones-close-on-scroll` | `closeOnScroll` | Boolean | `data-ones-close-on-scroll="true"` |
| `data-ones-close-on-outside` | `closeOnOutside` | Boolean | `data-ones-close-on-outside="true"` |
| `data-ones-submit-form` | `submitForm` | Boolean | `data-ones-submit-form="true"` |
| `data-ones-submit-on-outside` | `submitOnOutside` | Boolean | `data-ones-submit-on-outside="true"` |
| `data-ones-form-id` | `formId` | String | `data-ones-form-id="myForm"` |
| `data-ones-auto-load` | `autoLoad` | Boolean | `data-ones-auto-load="false"` |
| `data-ones-ajax` | `ajax` | String/Object | `data-ones-ajax="/api/items"` or `data-ones-ajax='{"url": "/api/items","method":"POST"}'` |

### Example:

```html
<div id="mySelect"
    data-ones-placeholder="Select products..."
    data-ones-data='["Apple", "Banana", "Cherry"]'
    data-ones-show-badges="true"
    data-ones-name="fruits"
></div>

<script>
$('#mySelect').oneSelect({
    // JS options (data attributes override these)
});
</script>
```

---

## 🔧 Methods

Call via jQuery plugin method:

```javascript
// Get selected values
var values = $('#mySelect').oneSelect('getValues');
var labels = $('#mySelect').oneSelect('getLabels');

// Set selection
$('#mySelect').oneSelect('value', ['Apple', 'Banana']);

// Update data
$('#mySelect').oneSelect('updateData', ['New', 'Data']);

// Load data via AJAX
$('#mySelect').oneSelect('loadData');

// Selection control
$('#mySelect').oneSelect('selectAll');
$('#mySelect').oneSelect('unselectAll');
$('#mySelect').oneSelect('select', 'Apple');
$('#mySelect').oneSelect('unselect', 'Banana');
$('#mySelect').oneSelect('toggleSelection', 'Cherry');

// Dropdown control
$('#mySelect').oneSelect('open');
$('#mySelect').oneSelect('close');

// Get instance ID
var instanceId = $('#mySelect').oneSelect('getInstanceId');

// Get instance object
var instance = OneSelect.getInstance(instanceId);

// Get all instances
var allInstances = OneSelect.getAllInstances();

// Destroy
$('#mySelect').oneSelect('destroy');
```

---

## 🎯 Callbacks

### onChange(values, labels)

Called every time selection changes. Most important callback.

```javascript
$('#mySelect').oneSelect({
    data: ['A', 'B', 'C'],
    onChange: function(values, labels) {
        console.log('Values:', values);
        console.log('Labels:', labels);
        // values: ['A', 'C']
        // labels: ['A', 'C']
    }
});
```

### onOk(values, labels)

Called when OK button is clicked.

```javascript
$('#mySelect').oneSelect({
    onOk: function(values, labels) {
        alert('Selected: ' + labels.join(', '));
    }
});
```

### onCancel()

Called when Cancel button is clicked and clears all selections.

```javascript
$('#mySelect').oneSelect({
    onCancel: function() {
        console.log('Selection cancelled');
    }
});
```

### AJAX Callbacks

```javascript
$('#mySelect').oneSelect({
    ajax: {
        url: '/api/items',
        method: 'GET'
    },
    beforeLoad: function() {
        $('#loading').show();
    },
    afterLoad: function(response) {
        $('#loading').hide();
        console.log('Data loaded:', response);
    },
    onLoadError: function(error) {
        $('#error').text('Error: ' + error);
    }
});
```

---

## 📚 Examples

### 1. Basic Usage

```javascript
$('#mySelect').oneSelect({
    placeholder: 'Select fruits...',
    data: ['Apple', 'Banana', 'Cherry', 'Mango']
});
```

### 2. How It Works

**Data Format:** Now supports both String Array and Key-Value Object

#### Option 1: String Array (original)
```javascript
data: ['Apple', 'Banana', 'Cherry']
```
**Result:**
- **value** (what gets submitted): `0, 1, 2` (array indices)
- **label** (what user sees): `'Apple', 'Banana', 'Cherry'`

#### Option 2: Key-Value Object (NEW!)
```javascript
data: {
  'fruit_1': 'Apple',
  'fruit_2': 'Banana',
  'fruit_3': 'Cherry'
}
```
**Result:**
- **value** (what gets submitted): `'fruit_1', 'fruit_2', 'fruit_3'` (keys)
- **label** (what user sees): `'Apple', 'Banana', 'Cherry'` (values)

**Perfect for:**
- Database IDs as keys
- Backend-generated key-value pairs
- Real-world data structures

**Example with PHP data:**
```php
// PHP
$items = [
    5 => "M.Hadi_9_6/1",
    6 => "Sarayevo_20_4/2/1",
    7 => "Sarayevo_13B_3/2/1"
];
echo json_encode($items);
// Output: {"5":"M.Hadi_9_6/1","6":"Sarayevo_20_4/2/1","7":"Sarayevo_13B_3/2/1"}
```

```javascript
// JavaScript
$('#mySelect').oneSelect({
    data: {"5":"M.Hadi_9_6/1", "6":"Sarayevo_20_4/2/1", "7":"Sarayevo_13B_3/2/1"}
});
// value: "5", "6", "7" (keys - submitted to form)
// label: "M.Hadi_9_6/1", "Sarayevo_20_4/2/1", "Sarayevo_13B_3/2/1" (values - displayed to user)
```

### 2.1. AJAX with Simple URL (NEW!)

**Easy AJAX setup with just URL:**

```javascript
// Method 1: JavaScript configuration
$('#mySelect').oneSelect({
    ajax: {
        url: '/api/fruits',
        method: 'GET'  // Default is GET
    },
    autoLoad: true
});
```

```html
<!-- Method 2: HTML data attribute (easiest!) -->
<div id="mySelect" data-ones-ajax="/api/fruits"></div>

<script>
$('#mySelect').oneSelect();
</script>
```

**Advanced AJAX configuration:**
```html
<div id="mySelect"
     data-ones-ajax='{"url":"/api/fruits","method":"POST","data":{"category":"fresh"}}'>
</div>
```

### 3. Value Parameter (Pre-selected Items)

```javascript
// Single value (by index)
$('#mySelect').oneSelect({
    data: ['Apple', 'Banana', 'Cherry', 'Mango'],
    value: 0           // Index 0 ('Apple') will be selected
});

// Array with multiple selection
$('#mySelect').oneSelect({
    data: ['Apple', 'Banana', 'Cherry', 'Mango'],
    value: [0, 2],  // Indices 0 ('Apple') and 2 ('Cherry') will be selected
    showBadges: true
});

// HTML data attribute
<div class="one-select"
    data-ones-data='["Apple", "Banana", "Cherry"]'
    data-ones-value='"0"'>      <!-- Single index -->
</div>

<!-- OR -->
<div class="one-select"
    data-ones-data='["Apple", "Banana", "Cherry"]'
    data-ones-value='["0", "2"]'>  <!-- Multiple indices -->
</div>
```

### 4. Badge System

```javascript
// Trigger badges
$('#mySelect').oneSelect({
    data: ['A', 'B', 'C'],
    showBadges: true
});

// External badges
<div id="badgesContainer"></div>

$('#mySelect').oneSelect({
    data: ['A', 'B', 'C'],
    showBadgesExternal: 'badgesContainer'
});
```

### 5. Form Submission

```javascript
$('#mySelect').oneSelect({
    data: ['Item 1', 'Item 2'],
    name: 'items',
    multiple: true,
    submitForm: true,
    formId: 'myForm'
});
```

Backend example:
```javascript
// Receive items array: [0, 1] (indices of selected items)
// Use indices to get original values from your data array
```

### 6. AJAX Data Loading

```javascript
$('#mySelect').oneSelect({
    ajax: {
        url: '/api/categories',
        method: 'GET'
    },
    beforeLoad: function() {
        console.log('Loading...');
    },
    afterLoad: function(response) {
        console.log('Loaded:', response);
    }
});
```

### 7. Multiple Instances

```javascript
// Each has independent ID
var fruits = $('#fruits').oneSelect({
    data: ['Apple', 'Banana', 'Cherry']
});

var colors = $('#colors').oneSelect({
    data: ['Red', 'Blue', 'Green']
});

// External control over instances
var fruitsInstance = OneSelect.getInstance(
    $('#fruits').oneSelect('getInstanceId')
);
fruitsInstance.selectAll();
```

### 8. Search Feature

```javascript
// Enable local search (filters existing data)
$('#mySelect').oneSelect({
    data: ['Apple', 'Banana', 'Cherry', 'Mango', 'Orange', 'Grape'],
    showSearch: true,
    searchPlaceholder: 'Type to search...'
});

// Enable AJAX search (with debounce)
$('#mySelect').oneSelect({
    showSearch: true,
    searchUrl: '/api/search',
    searchDebounceDelay: 500,
    searchPlaceholder: 'Search items...'
});

// HTML data attribute example (local search)
<div class="one-select"
    data-ones-data='["Apple", "Banana", "Cherry", "Mango"]'
    data-ones-show-search="true"
    data-ones-search-placeholder="Find a fruit...">
</div>

// HTML data attribute example (AJAX search)
<div class="one-select"
    data-ones-show-search="true"
    data-ones-search-url="/api/customers/search"
    data-ones-search-debounce-delay="300"
    data-ones-search-placeholder="Search customers...">
</div>
```

**AJAX Search Server Response Format:**

The server should respond with JSON in one of these formats:

```json
// Direct array
["Apple", "Banana", "Cherry"]

// Wrapped with 'data'
{
    "data": [{"value": 1, "label": "Apple"}, {"value": 2, "label": "Banana"}]
}

// Wrapped with 'results'
{
    "results": ["Apple", "Banana"]
}
```

The request will be sent as `GET /api/search?q=searchterm`

---

## 📦 Horizontal Scroll Behavior

**Automatic dropdown closing on horizontal scroll:**

The dropdown automatically closes when the user performs any horizontal scrolling action while the dropdown is open. This prevents the dropdown from appearing in the wrong position when:

- Tables with `overflow-x: auto` are scrolled horizontally
- Any scrollable container is scrolled horizontally
- Touchpad/trackpad horizontal gestures are used
- Mouse wheel horizontal scrolling is performed

### How It Works

The plugin uses two methods to detect horizontal scroll:

1. **Wheel Event Detection**: Detects horizontal mouse/touchpad scrolling in real-time
2. **Periodic Scroll Checking**: Every 50ms, checks if any scrollable element's `scrollLeft` position has changed

When horizontal scroll is detected, the dropdown immediately closes.

### Example

```html
<div style="overflow-x: auto; width: 100%;">
    <table style="width: 2000px;">
        <tr>
            <td>
                <div id="mySelect"></div>
            </td>
            <td>Other columns...</td>
        </tr>
    </table>
</div>

<script>
$('#mySelect').oneSelect({
    data: ['Apple', 'Banana', 'Cherry']
});
</script>
```

**Behavior:**
- User opens dropdown ✅
- User scrolls table horizontally → **Dropdown closes automatically** ✅

---

## 🔄 AJAX Integration

### AJAX Configuration

```javascript
$('#mySelect').oneSelect({
    ajax: {
        url: '/api/items',
        method: 'GET',
        data: { category: 'fruits', active: true }
    },
    autoLoad: false
});

// Manual load
$('#loadBtn').on('click', function() {
    $('#mySelect').oneSelect('loadData', {
        url: '/api/different-items',
        data: { filter: 'active' }
    });
});
```

### Supported Response Formats

**1. Direct array:**
```json
["Apple", "Banana", "Cherry"]
```

**2. Wrapped with 'data':**
```json
{
    "data": ["Apple", "Banana"]
}
```

**3. Wrapped with 'results':**
```json
{
    "results": ["Apple", "Banana"]
}
```

**4. Object array:**
```json
[
    {"value": 1, "label": "Apple"},
    {"value": 2, "label": "Banana"}
]
```

---

## 📝 Form Submission

### Hidden Inputs

Component automatically creates `<input type="hidden">` elements:

```javascript
$('#mySelect').oneSelect({
    name: 'items',
    multiple: true,
    data: ['A', 'B', 'C']
});
```

HTML result:
```html
<input type="hidden" name="items[]" value="A">
<input type="hidden" name="items[]" value="B">
<input type="hidden" name="items[]" value="C">
```

---

## 🏷️ Badge System

### Trigger Badges

```javascript
$('#mySelect').oneSelect({
    showBadges: true
});
```

Result: `[Apple ×] [Banana ×] [Cherry ×]`

### External Badges

```javascript
<div id="myBadges"></div>

$('#mySelect').oneSelect({
    showBadgesExternal: 'myBadges'
});
```

### Badge Properties

- **Background:** `#3b82f6` (light blue)
- **Text color:** `#fff` (white)
- **Remove button (×):** `#fff` (white)
- **Hover:** Light gray background
- **Remove:** Clicking × button unselects item

### Both Together

```javascript
$('#mySelect').oneSelect({
    showBadges: true,              // Badge in trigger
    showBadgesExternal: 'myBadges'  // Badge outside as well
});
```

---

## 🎨 CSS Styling

Main CSS classes with `cms-` prefix:

```css
.one-select               /* Main container (relative positioned) */
.cms-wrapper              /* Wrapper (relative positioned) */
.cms-trigger               /* Button that opens dropdown */
.cms-selected-text         /* Selected text */
.cms-dropdown               /* Dropdown menu (absolute positioned) */
.cms-search-wrapper        /* Search input wrapper */
.cms-search-input          /* Search input field */
.cms-options-container      /* Options container */
.cms-options-container.cms-loading  /* Loading state for AJAX search */
.cms-option                /* Single option */
.cms-option.selected         /* Selected option */
.cms-option.select-all       /* "Select All" option */
.cms-badge                 /* Badge */
.cms-badge-remove          /* Badge × button */
.cms-btn                   /* OK/Cancel buttons */
```

### DOM Structure

```html
<!-- Wrapper element (your container) -->
<div class="one-select">
    <div class="cms-wrapper">
        <div class="cms-trigger">
            <span class="cms-selected-text">Select...</span>
        </div>
    </div>
</div>

<!-- Dropdown is appended to body with dynamic positioning -->
<div class="cms-dropdown" style="position: fixed; top: ...; left: ...; width: ...;">
    <!-- Search input (when showSearch is true) -->
    <div class="cms-search-wrapper">
        <input type="text" class="cms-search-input" placeholder="Search...">
    </div>
    <div class="cms-options-container">
        <div class="cms-option select-all">...</div>
        <div class="cms-option">...</div>
    </div>
    <div class="cms-buttons">
        <button class="cms-btn cms-btn-ok">OK</button>
        <button class="cms-btn cms-btn-cancel">Cancel</button>
    </div>
</div>
```

**Note:** The dropdown is positioned using `position: fixed` with viewport coordinates (`getBoundingClientRect()`). This ensures it stays correctly positioned even when parent elements scroll.

### Custom CSS Example

```css
/* Selected option styling */
.cms-option.selected label {
    font-weight: 600;
    color: #007bff;
}

/* Badge styling */
.cms-badge {
    background: #3b82f6;
    color: #fff;
    border-radius: 12px;
    padding: 3px 8px;
}

/* Search input styling */
.cms-search-input {
    background: #f8f9fa;
    border-color: #dee2e6;
}
.cms-search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

/* Custom dropdown width */
.one-select {
    width: 400px;
}
```

---

## 🚀 Quick Usage Examples

```javascript
// 1. Simple
$('#select1').oneSelect({
    data: ['A', 'B', 'C']
});

// 2. Pre-selected items (by index)
$('#select2').oneSelect({
    data: ['Apple', 'Banana', 'Cherry'],
    value: [0, 2]  // Selects indices 0 and 2
});

// 3. Key-Value Object (NEW!)
$('#select3').oneSelect({
    data: {
        'id_1': 'Apple',
        'id_2': 'Banana',
        'id_3': 'Cherry'
    },
    value: ['id_1', 'id_3'],  // Selects by keys
    name: 'fruits'
});

// 4. Badges
$('#select4').oneSelect({
    data: ['X', 'Y', 'Z'],
    showBadges: true
});

// 5. Form submission
$('#select5').oneSelect({
    data: ['P1', 'P2'],
    name: 'products',
    multiple: true,
    submitForm: true,
    formId: 'myForm'
});

// 6. AJAX with simple URL (NEW!)
$('#select6').oneSelect({
    ajax: {url: '/api/items'},
    autoLoad: true
});

// OR using data attribute (easiest):
// <div id="select6" data-ones-ajax="/api/items"></div>

// 7. Click outside behavior
$('#select7').oneSelect({
    closeOnOutside: true   // Close when clicking outside (default)
});

// 8. Search feature (local filtering)
$('#select8').oneSelect({
    data: ['Apple', 'Banana', 'Cherry', 'Mango', 'Orange'],
    showSearch: true,
    searchPlaceholder: 'Search fruits...'
});

// 9. AJAX search with debounce
$('#select9').oneSelect({
    showSearch: true,
    searchUrl: '/api/search',
    searchDebounceDelay: 500
});
```

---

## 📞 Support

### Links

- **NPM Package:** [@kamranbaylarov/one-select](https://www.npmjs.com/package/@kamranbaylarov/one-select)
- **GitHub:** [KamranBeylarov/one-select](https://github.com/KamranBeylarov/one-select)
- **Issues:** [Report issues](https://github.com/KamranBeylarov/one-select/issues)

### Installation

```bash
# NPM
npm install @kamranbaylarov/one-select

# CDN (coming soon)
```

### Project Structure

```
one-select/
├── css/
│   └── one-select.min.css
├── js/
│   ├── one-select.js
│   └── one-select.min.js
├── package.json
└── README.md
```

### License

MIT License - Feel free to use in your projects!

---

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

---

**OneSelect** makes multi-select dropdowns simple and powerful! 🚀

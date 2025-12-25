/**
 * OneSelect - jQuery Multi-Select Dropdown Plugin
 * Version: 1.0.0
 * https://github.com/your-repo/one-select
 *
 * Copyright 2024
 * Licensed under MIT
 *
 * A powerful, flexible, and feature-rich multi-select dropdown component for jQuery.
 */

(function(factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = function(root, jQuery) {
            if (jQuery === undefined) {
                if (typeof window !== 'undefined') {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(window.jQuery || window.$);
    }

}(function($) {
    'use strict';

    // Global registry for all instances
    var instances = {};
    var pluginName = 'oneSelect';

    /**
     * Debounce utility function
     * @param {Function} func - Function to debounce
     * @param {Number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    function debounce(func, delay) {
        var timeoutId;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function() {
                func.apply(context, args);
            }, delay);
        };
    }

    /**
     * OneSelect Constructor
     * @param {HTMLElement} element - The DOM element
     * @param {Object} options - Configuration options
     */
    var OneSelect = function(element, options) {
        this.element = element;
        this.$element = $(element);

        // Generate unique instance ID for control
        this.instanceId = 'ones-' + Math.random().toString(36).substr(2, 9);

        // Read data attributes from element (highest priority)
        var dataOptions = this.readDataAttributes();

        // Merge: defaults -> options (JS) -> dataOptions (HTML attributes)
        this.settings = $.extend({}, OneSelect.defaults, options, dataOptions);
        this.init();
    };

    /**
     * Default configuration options
     */
    OneSelect.defaults = {
        placeholder: 'Select options...',
        selectAllText: 'Select All',
        okText: 'OK',
        cancelText: 'Cancel',
        data: [],
        selectedValues: [],
        value: null,             // Single value or array of values to pre-select
        valueField: 'value',
        labelField: 'label',
        showCheckbox: true,
        showBadges: false,
        showBadgesExternal: null,
        showSearch: false,       // Show search input in dropdown
        searchPlaceholder: 'Search...',
        searchUrl: null,         // URL for AJAX search (GET request)
        searchDebounceDelay: 300,// Delay in milliseconds for search debounce
        closeOnScroll: false,
        closeOnOutside: true,    // Close dropdown when clicking outside (default: true)
        submitForm: false,
        submitOnOutside: false,
        formId: null,
        name: null,
        multiple: true,
        ajax: null,
        autoLoad: true,
        beforeLoad: null,
        afterLoad: null,
        onLoadError: null,
        onChange: null,
        onSelect: null,
        onOk: null,
        onCancel: null
    };

    /**
     * OneSelect Prototype
     */
    OneSelect.prototype = {
        /**
         * Read data attributes from HTML element
         */
        readDataAttributes: function() {
            var self = this;
            var dataOptions = {};

            var attributeMap = {
                'ones-placeholder': 'placeholder',
                'ones-select-all-text': 'selectAllText',
                'ones-ok-text': 'okText',
                'ones-cancel-text': 'cancelText',
                'ones-data': 'data',
                'ones-selected': 'selectedValues',
                'ones-value': 'value',
                'ones-value-field': 'valueField',
                'ones-label-field': 'labelField',
                'ones-name': 'name',
                'ones-multiple': 'multiple',
                'ones-show-checkbox': 'showCheckbox',
                'ones-show-badges': 'showBadges',
                'ones-show-badges-external': 'showBadgesExternal',
                'ones-show-search': 'showSearch',
                'ones-search-placeholder': 'searchPlaceholder',
                'ones-search-url': 'searchUrl',
                'ones-search-debounce-delay': 'searchDebounceDelay',
                'ones-close-on-scroll': 'closeOnScroll',
                'ones-close-on-outside': 'closeOnOutside',
                'ones-submit-form': 'submitForm',
                'ones-submit-on-outside': 'submitOnOutside',
                'ones-form-id': 'formId',
                'ones-auto-load': 'autoLoad'
            };

            $.each(attributeMap, function(attr, setting) {
                var value = self.$element.data(attr);

                if (value === undefined) {
                    return;
                }

                if (setting === 'data' || setting === 'selectedValues' || setting === 'value') {
                    if (typeof value === 'string') {
                        try {
                            dataOptions[setting] = JSON.parse(value);
                        } catch (e) {
                            console.warn('OneSelect: Invalid JSON for ' + attr, value);
                            dataOptions[setting] = value;
                        }
                    } else {
                        dataOptions[setting] = value;
                    }
                } else if (setting === 'multiple' || setting === 'showCheckbox' ||
                           setting === 'showBadges' || setting === 'showSearch' ||
                           setting === 'closeOnScroll' || setting === 'closeOnOutside' ||
                           setting === 'submitForm' || setting === 'submitOnOutside' ||
                           setting === 'autoLoad') {
                    if (typeof value === 'string') {
                        dataOptions[setting] = value === 'true' || value === '1';
                    } else {
                        dataOptions[setting] = !!value;
                    }
                } else if (setting === 'searchDebounceDelay') {
                    // Parse as number
                    if (typeof value === 'string') {
                        dataOptions[setting] = parseInt(value, 10) || 300;
                    } else {
                        dataOptions[setting] = value || 300;
                    }
                } else {
                    dataOptions[setting] = value;
                }
            });

            var ajaxData = this.$element.data('ones-ajax');
            if (ajaxData) {
                if (typeof ajaxData === 'string') {
                    try {
                        dataOptions.ajax = JSON.parse(ajaxData);
                    } catch (e) {
                        console.warn('OneSelect: Invalid JSON for ones-ajax', ajaxData);
                    }
                } else {
                    dataOptions.ajax = ajaxData;
                }
            }

            return dataOptions;
        },

        init: function() {
            // Register instance in global registry
            instances[this.instanceId] = this;

            // Merge value parameter into selectedValues
            this.settings.selectedValues = this.mergeValueSettings(this.settings.value, this.settings.selectedValues);

            this.wrapper = this.createWrapper();
            this.trigger = this.createTrigger();
            this.dropdown = this.createDropdown();
            this.searchInput = this.createSearchInput();
            this.optionsContainer = this.createOptionsContainer();
            this.buttons = this.createButtons();

            this.build();
            this.attachEvents();

            if (this.settings.ajax && this.settings.autoLoad) {
                this.loadData();
            }
        },

        /**
         * Merge value parameter into selectedValues array
         * @param {*} value - Single value or array of values
         * @param {Array} selectedValues - Existing selected values
         * @returns {Array} Merged array of selected values
         */
        mergeValueSettings: function(value, selectedValues) {
            var result = selectedValues ? [].concat(selectedValues) : [];

            if (value !== null && value !== undefined) {
                if (Array.isArray(value)) {
                    // value is an array - merge all items
                    $.each(value, function(i, v) {
                        if ($.inArray(v, result) === -1) {
                            result.push(v);
                        }
                    });
                } else {
                    // value is a single value - add if not already present
                    if ($.inArray(value, result) === -1) {
                        result.push(value);
                    }
                }
            }

            return result;
        },

        build: function() {
            // Add search input at the top of dropdown if enabled
            if (this.settings.showSearch) {
                this.dropdown.append(this.searchInput);
            }
            this.dropdown.append(this.optionsContainer);
            this.dropdown.append(this.buttons);
            this.wrapper.append(this.trigger);

            // Append wrapper to $element, dropdown to body
            this.$element.append(this.wrapper);
            $('body').append(this.dropdown);

            this.renderOptions();
            this.updateTriggerText();
            this.updateHiddenInputs();
        },

        updateHiddenInputs: function() {
            if (!this.settings.name) {
                return;
            }

            var form = null;
            if (this.settings.formId) {
                form = $('#' + this.settings.formId);
            } else {
                form = this.$element.closest('form');
            }

            var container = form.length ? form : this.wrapper;

            container.find('input.cms-hidden-input[data-cms-input="' + this.settings.name + '"]').remove();

            var inputName = this.settings.name;
            if (this.settings.multiple && inputName.indexOf('[') === -1) {
                inputName += '[]';
            }

            var selectedValues = this.getSelectedValues();

            if (this.settings.multiple) {
                $.each(selectedValues, function(index, value) {
                    var hiddenInput = $('<input type="hidden" class="cms-hidden-input">')
                        .attr('name', inputName)
                        .attr('value', value)
                        .attr('data-cms-input', this.settings.name)
                        .attr('data-cms-value', value);
                    container.append(hiddenInput);
                }.bind(this));
            } else {
                var value = selectedValues.length > 0 ? selectedValues.join(',') : '';
                var hiddenInput = $('<input type="hidden" class="cms-hidden-input">')
                    .attr('name', inputName)
                    .attr('value', value)
                    .attr('data-cms-input', this.settings.name);
                container.append(hiddenInput);
            }
        },

        createWrapper: function() {
            return $('<div class="cms-wrapper"></div>');
        },

        createTrigger: function() {
            return $('<div class="cms-trigger"><span class="cms-selected-text cms-placeholder">' +
                    this.settings.placeholder + '</span></div>');
        },

        createDropdown: function() {
            return $('<div class="cms-dropdown"></div>');
        },

        createSearchInput: function() {
            return $('<div class="cms-search-wrapper">' +
                    '<input type="text" class="cms-search-input" placeholder="' +
                    this.settings.searchPlaceholder + '" /></div>');
        },

        createOptionsContainer: function() {
            return $('<div class="cms-options-container"></div>');
        },

        createButtons: function() {
            var container = $('<div class="cms-buttons"></div>');
            this.okBtn = $('<button class="cms-btn cms-btn-ok">' + this.settings.okText + '</button>');
            this.cancelBtn = $('<button class="cms-btn cms-btn-cancel">' + this.settings.cancelText + '</button>');

            container.append(this.okBtn);
            container.append(this.cancelBtn);

            return container;
        },

        renderOptions: function() {
            this.optionsContainer.empty();

            var selectAllOption = this.createOption('select-all', this.settings.selectAllText, false);
            this.optionsContainer.append(selectAllOption);

            var self = this;
            $.each(this.settings.data, function(index, item) {
                var value, label;

                if (typeof item === 'object' && !Array.isArray(item) && item !== null) {
                    // Check if it's an object with valueField/labelField properties
                    if (self.settings.valueField in item && self.settings.labelField in item) {
                        value = item[self.settings.valueField];
                        label = item[self.settings.labelField];
                    } else {
                        // Plain object (key-value pair): key -> value, value -> label
                        value = index;
                        label = item;
                    }
                } else {
                    // String, number, or other primitive: value = label = item
                    value = item;
                    label = item;
                }

                var isSelected = $.inArray(value, self.settings.selectedValues) !== -1;
                var option = self.createOption(value, label, isSelected);
                self.optionsContainer.append(option);
            });

            this.updateSelectAllState();
        },

        createOption: function(value, label, checked) {
            var optionClass = 'cms-option';
            if (!this.settings.showCheckbox) {
                optionClass += ' cms-hide-checkbox';
            }

            if (checked && value !== 'select-all') {
                optionClass += ' selected';
            }

            var option = $('<div class="' + optionClass + '" data-value="' + value + '"></div>');
            var checkbox = $('<input type="checkbox" value="' + value + '"' +
                           (checked ? ' checked' : '') + '>');
            var labelEl = $('<label>' + label + '</label>');

            option.append(checkbox);
            option.append(labelEl);

            return option;
        },

        /**
         * Filter options based on search text
         * @param {String} searchText - Search text to filter by
         */
        filterOptions: function(searchText) {
            var self = this;
            var options = this.optionsContainer.find('.cms-option:not([data-value="select-all"])');

            if (searchText === '') {
                // Show all options if search is empty
                options.show();
            } else {
                // Filter options by label
                options.each(function() {
                    var option = $(this);
                    var label = option.find('label').text().toLowerCase();

                    if (label.indexOf(searchText) !== -1) {
                        option.show();
                    } else {
                        option.hide();
                    }
                });
            }
        },

        /**
         * Perform AJAX search
         * @param {String} searchText - Search text to send to server
         */
        performAjaxSearch: function(searchText) {
            var self = this;

            // Show loading state
            this.optionsContainer.addClass('cms-loading');

            $.ajax({
                url: this.settings.searchUrl,
                method: 'GET',
                data: { q: searchText },
                dataType: 'json',
                success: function(response) {
                    // Handle different response formats
                    var data = response;
                    if (typeof response === 'object' && response.data) {
                        data = response.data;
                    } else if (typeof response === 'object' && response.results) {
                        data = response.results;
                    }

                    // Update dropdown with search results
                    self.updateSearchResults(data || []);

                    self.optionsContainer.removeClass('cms-loading');
                },
                error: function(xhr, status, error) {
                    console.error('OneSelect: Search error', error);
                    self.optionsContainer.removeClass('cms-loading');

                    if (self.settings.onLoadError) {
                        self.settings.onLoadError.call(self, xhr, status, error);
                    }
                }
            });
        },

        /**
         * Update dropdown with search results
         * @param {Array} data - Search results data
         */
        updateSearchResults: function(data) {
            // Clear existing options (except select-all)
            this.optionsContainer.find('.cms-option:not([data-value="select-all"])').remove();

            var self = this;
            $.each(data, function(index, item) {
                var value, label;

                if (typeof item === 'object' && !Array.isArray(item) && item !== null) {
                    // Check if it's an object with valueField/labelField properties
                    if (self.settings.valueField in item && self.settings.labelField in item) {
                        value = item[self.settings.valueField];
                        label = item[self.settings.labelField];
                    } else {
                        // Plain object (key-value pair): key -> value, value -> label
                        value = index;
                        label = item;
                    }
                } else {
                    // String, number, or other primitive: value = label = item
                    value = item;
                    label = item;
                }

                // Keep selection state if value was previously selected
                var isSelected = $.inArray(value, self.settings.selectedValues) !== -1;
                var option = self.createOption(value, label, isSelected);
                self.optionsContainer.append(option);
            });

            // Update select-all state
            this.updateSelectAllState();
        },

        attachEvents: function() {
            var self = this;

            this.trigger.on('click', function(e) {
                e.stopPropagation();
                self.toggle();
            });

            // Search input event listener
            if (this.settings.showSearch) {
                if (this.settings.searchUrl) {
                    // AJAX search with debounce
                    var debouncedSearch = debounce(function(searchText) {
                        self.performAjaxSearch(searchText);
                    }, this.settings.searchDebounceDelay);

                    this.searchInput.find('.cms-search-input').on('keyup', function() {
                        var searchText = $(this).val();
                        if (searchText.length > 0) {
                            debouncedSearch(searchText);
                        } else {
                            // Show original data when search is empty
                            self.filterOptions('');
                        }
                    });
                } else {
                    // Local filtering (default)
                    this.searchInput.find('.cms-search-input').on('keyup', function() {
                        var searchText = $(this).val().toLowerCase();
                        self.filterOptions(searchText);
                    });
                }
            }

            $(window).on('resize.cms', function() {
                if (self.wrapper.hasClass('open')) {
                    self.updateDropdownPosition();
                }
            });

            if (this.settings.closeOnScroll) {
                $(window).on('scroll.cms', function() {
                    if (self.wrapper.hasClass('open')) {
                        self.close();
                    }
                });
            } else {
                // Update dropdown position on vertical scroll
                $(window).on('scroll.cms', function() {
                    if (self.wrapper.hasClass('open')) {
                        self.updateDropdownPosition();
                    }
                });
            }

            // Global horizontal scroll handler - close dropdown on any horizontal scroll
            // Listen for wheel events with horizontal delta
            $(document).on('wheel.onescroll', function(e) {
                if (!self.wrapper.hasClass('open')) {
                    return;
                }

                // Check if horizontal scrolling (deltaX != 0)
                if (e.originalEvent && Math.abs(e.originalEvent.deltaX) > 0) {
                    self.close();
                }
            });

            // Also listen for scroll events on all elements to detect horizontal scroll
            // Using MutationObserver to detect when elements with overflow scroll
            self._detectHorizontalScroll = function() {
                if (!self.wrapper.hasClass('open')) return;

                // Check window horizontal scroll
                if (window.scrollX !== self._lastWindowScrollX) {
                    self._lastWindowScrollX = window.scrollX;
                    if (self._lastWindowScrollX > 0) {
                        self.close();
                        return;
                    }
                }

                // Check all scrollable elements for horizontal scroll
                var scrollableElements = document.querySelectorAll('*');
                for (var i = 0; i < scrollableElements.length; i++) {
                    var el = scrollableElements[i];
                    var key = getElementKey(el);

                    if (self._elementScrollPositions[key] !== undefined) {
                        var currentScroll = el.scrollLeft;
                        if (currentScroll !== self._elementScrollPositions[key]) {
                            // Horizontal scroll detected
                            self.close();
                            return;
                        }
                    }
                }
            };

            // Store scroll positions and track changes
            self._elementScrollPositions = {};
            self._lastWindowScrollX = window.scrollX;

            function getElementKey(el) {
                if (el === document) return 'document';
                if (el === document.documentElement) return 'html';
                if (el === document.body) return 'body';
                return el.tagName + '-' + (el.id || el.className || Math.random().toString(36).substr(2, 9));
            }

            // Override open to initialize tracking
            var originalOpen = self.open.bind(self);
            self.open = function() {
                // Store initial scroll positions
                self._elementScrollPositions = {};
                self._lastWindowScrollX = window.scrollX;

                var scrollableElements = document.querySelectorAll('*');
                for (var i = 0; i < scrollableElements.length; i++) {
                    var el = scrollableElements[i];
                    if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
                        self._elementScrollPositions[getElementKey(el)] = el.scrollLeft;
                    }
                }

                // Start checking periodically
                if (self._horizontalScrollInterval) {
                    clearInterval(self._horizontalScrollInterval);
                }
                self._horizontalScrollInterval = setInterval(function() {
                    self._detectHorizontalScroll();
                }, 50);

                originalOpen();
            };

            // Override close to stop tracking
            var originalClose = self.close.bind(self);
            self.close = function() {
                if (self._horizontalScrollInterval) {
                    clearInterval(self._horizontalScrollInterval);
                    self._horizontalScrollInterval = null;
                }
                self._elementScrollPositions = {};
                originalClose();
            };

            // Window click handler - close dropdown when clicking outside
            $(window).on('click.ones', function(e) {
                if (!self.settings.closeOnOutside) {
                    return;
                }

                if (!self.wrapper.hasClass('open')) {
                    return;
                }

                var $target = $(e.target);
                // Don't close if clicked inside dropdown or wrapper elements
                if ($target.closest('.cms-wrapper').length > 0 ||
                    $target.closest('.cms-dropdown').length > 0) {
                    return;
                }

                // Submit form if submitOnOutside is enabled
                if (self.settings.submitOnOutside) {
                    self.updateTriggerText();
                    if (self.settings.onOk) {
                        self.settings.onOk.call(self, self.getSelectedValues(), self.getSelectedLabels());
                    }
                    self.submitForm();
                }

                self.close();
            });

            this.optionsContainer.on('click', '.cms-option', function(e) {
                e.stopPropagation();

                var option = $(this);
                var checkbox = option.find('input[type="checkbox"]');

                if ($(e.target).is('input[type="checkbox"]')) {
                    return;
                }

                checkbox.prop('checked', !checkbox.prop('checked'));
                self.handleOptionChange(option);
            });

            this.optionsContainer.on('change', 'input[type="checkbox"]', function(e) {
                e.stopPropagation();
                var option = $(e.target).closest('.cms-option');
                self.handleOptionChange(option);
            });

            this.okBtn.on('click', function(e) {
                e.stopPropagation();
                self.handleOk();
            });

            this.cancelBtn.on('click', function(e) {
                e.stopPropagation();
                self.handleCancel();
            });
        },

        handleOptionChange: function(option) {
            var value = option.data('value');

            if (value === 'select-all') {
                var checkbox = option.find('input[type="checkbox"]');
                this.handleSelectAll(checkbox.prop('checked'));
            } else {
                var checkbox = option.find('input[type="checkbox"]');
                if (checkbox.prop('checked')) {
                    option.addClass('selected');
                } else {
                    option.removeClass('selected');
                }

                var self = this;
                setTimeout(function() {
                    self.updateSelectAllState();
                    self.updateTriggerText();
                }, 0);
            }

            this.updateHiddenInputs();

            if (this.settings.onChange) {
                this.settings.onChange.call(this, this.getSelectedValues(), this.getSelectedLabels());
            }

            if (this.settings.onSelect) {
                this.settings.onSelect.call(this, this.getSelectedValues());
            }
        },

        handleSelectAll: function(checked) {
            var self = this;
            this.optionsContainer.find('.cms-option:not([data-value="select-all"])').each(function() {
                var option = $(this);
                option.find('input[type="checkbox"]').prop('checked', checked);
                if (checked) {
                    option.addClass('selected');
                } else {
                    option.removeClass('selected');
                }
            });

            this.updateSelectAllState();
            this.updateTriggerText();
            this.updateHiddenInputs();
        },

        updateSelectAllState: function() {
            var allOptions = this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"]');
            var checkedOptions = allOptions.filter(':checked');
            var totalCount = allOptions.length;
            var checkedCount = checkedOptions.length;

            var selectAllCheckbox = this.optionsContainer.find('.cms-option[data-value="select-all"] input[type="checkbox"]');

            selectAllCheckbox.prop('indeterminate', false);
            selectAllCheckbox.prop('checked', false);

            if (checkedCount === 0) {
                // Nothing selected
            } else if (checkedCount === totalCount && totalCount > 0) {
                selectAllCheckbox.prop('checked', true);
            } else {
                selectAllCheckbox.prop('indeterminate', true);
            }
        },

        getSelectedValues: function() {
            var values = [];
            this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"]:checked')
                .each(function() {
                    var val = $(this).val();
                    if (!isNaN(val) && val !== '') {
                        val = Number(val);
                    }
                    values.push(val);
                });
            return values;
        },

        getSelectedLabels: function() {
            var labels = [];
            this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"]:checked')
                .siblings('label')
                .each(function() {
                    labels.push($(this).text());
                });
            return labels;
        },

        updateTriggerText: function() {
            var labels = this.getSelectedLabels();
            var values = this.getSelectedValues();
            var textSpan = this.trigger.find('.cms-selected-text');

            if (labels.length === 0) {
                textSpan.empty().text(this.settings.placeholder).addClass('cms-placeholder');
            } else if (this.settings.showBadges) {
                textSpan.empty().removeClass('cms-placeholder');

                var self = this;
                $.each(values, function(index, value) {
                    var badge = $('<span class="cms-badge"></span>');
                    var labelSpan = $('<span></span>').text(labels[index]);
                    var removeBtn = $('<button type="button" class="cms-badge-remove">&times;</button>');

                    removeBtn.on('click', function(e) {
                        e.stopPropagation();
                        self.unselect(value);
                    });

                    badge.append(labelSpan);
                    badge.append(removeBtn);
                    textSpan.append(badge);
                });
            } else {
                textSpan.empty().removeClass('cms-placeholder');
                textSpan.text(labels.length + ' items selected');
            }

            this.updateExternalBadges(values, labels);
        },

        updateExternalBadges: function(values, labels) {
            if (!this.settings.showBadgesExternal) {
                return;
            }

            var $externalContainer = $('#' + this.settings.showBadgesExternal);

            if ($externalContainer.length === 0) {
                console.warn('OneSelect: External container not found - #' + this.settings.showBadgesExternal);
                return;
            }

            $externalContainer.empty();

            if (values.length === 0) {
                return;
            }

            var self = this;
            $.each(values, function(index, value) {
                var badge = $('<span class="cms-badge"></span>');
                var labelSpan = $('<span></span>').text(labels[index]);
                var removeBtn = $('<button type="button" class="cms-badge-remove">&times;</button>');

                removeBtn.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.unselect(value);
                });

                badge.append(labelSpan);
                badge.append(removeBtn);
                $externalContainer.append(badge);
            });
        },

        toggle: function() {
            if (this.wrapper.hasClass('open')) {
                this.close();
            } else {
                this.open();
            }
        },

        open: function() {
            // Close other open dropdowns
            $('.cms-wrapper.open').not(this.wrapper).removeClass('open');
            $('.cms-dropdown.open').not(this.dropdown).removeClass('open');

            // Calculate position
            this.updateDropdownPosition();

            this.wrapper.addClass('open');
            this.dropdown.addClass('open');
        },

        updateDropdownPosition: function() {
            var rect = this.wrapper[0].getBoundingClientRect();
            var wrapperHeight = this.wrapper.outerHeight();
            var wrapperWidth = this.wrapper.outerWidth();

            this.dropdown.css({
                position: 'fixed',
                top: rect.bottom + 'px',
                left: rect.left + 'px',
                width: wrapperWidth + 'px'
            });
        },

        close: function() {
            this.wrapper.removeClass('open');
            this.dropdown.removeClass('open');
        },

        handleOk: function() {
            this.updateTriggerText();

            var values = this.getSelectedValues();
            var labels = this.getSelectedLabels();

            if (this.settings.onOk) {
                this.settings.onOk.call(this, values, labels);
            }

            if (this.settings.submitForm) {
                this.submitForm();
            }

            this.close();
        },

        submitForm: function() {
            var form = null;

            if (this.settings.formId) {
                form = $('#' + this.settings.formId);
                if (form.length === 0) {
                    console.warn('OneSelect: Form with ID "' + this.settings.formId + '" not found');
                    return;
                }
            } else {
                form = this.$element.closest('form');
                if (form.length === 0) {
                    console.warn('OneSelect: No parent form found');
                    return;
                }
            }

            form[0].submit();
        },

        handleCancel: function() {
            this.settings.selectedValues = [];
            this.optionsContainer.find('input[type="checkbox"]').prop('checked', false);
            this.optionsContainer.find('.cms-option').removeClass('selected');
            this.updateSelectAllState();
            this.updateTriggerText();
            this.updateHiddenInputs();

            if (this.settings.onCancel) {
                this.settings.onCancel.call(this);
            }

            if (this.settings.submitForm) {
                this.submitForm();
            }

            this.close();
        },

        setValue: function(values) {
            this.settings.selectedValues = values || [];
            this.renderOptions();
            this.updateTriggerText();
            this.updateHiddenInputs();
        },

        getValue: function() {
            return this.getSelectedValues();
        },

        updateData: function(data) {
            this.settings.data = data || [];
            this.settings.selectedValues = [];
            this.renderOptions();
            this.updateTriggerText();
            this.updateHiddenInputs();
        },

        loadData: function(customAjaxConfig, onSuccess, onError) {
            var self = this;
            var ajaxConfig = customAjaxConfig || this.settings.ajax;

            if (!ajaxConfig || !ajaxConfig.url) {
                console.error('OneSelect: Ajax configuration or url is missing');
                return;
            }

            if (this.settings.beforeLoad) {
                this.settings.beforeLoad.call(this);
            }

            this.trigger.find('.cms-selected-text').text('Loading...');

            var request = $.extend(true, {
                url: ajaxConfig.url,
                method: ajaxConfig.method || 'GET',
                data: ajaxConfig.data || {},
                dataType: ajaxConfig.dataType || 'json',
                success: function(response) {
                    var data = response;
                    if (typeof response === 'object' && response.data) {
                        data = response.data;
                    } else if (typeof response === 'object' && response.results) {
                        data = response.results;
                    }

                    self.settings.data = data || [];
                    self.renderOptions();
                    self.updateTriggerText();

                    if (self.settings.afterLoad) {
                        self.settings.afterLoad.call(self, data, response);
                    }

                    if (onSuccess) {
                        onSuccess.call(self, data, response);
                    }
                },
                error: function(xhr, status, error) {
                    self.trigger.find('.cms-selected-text').text('Error loading data');

                    if (self.settings.onLoadError) {
                        self.settings.onLoadError.call(self, xhr, status, error);
                    }

                    if (onError) {
                        onError.call(self, xhr, status, error);
                    }
                }
            }, ajaxConfig);

            if (ajaxConfig.success) {
                var originalSuccess = request.success;
                request.success = function(response) {
                    ajaxConfig.success(response);
                    originalSuccess(response);
                };
            }

            if (ajaxConfig.error) {
                var originalError = request.error;
                request.error = function(xhr, status, error) {
                    ajaxConfig.error(xhr, status, error);
                    originalError(xhr, status, error);
                };
            }

            $.ajax(request);
        },

        reload: function() {
            if (this.settings.ajax) {
                this.loadData();
            } else {
                console.warn('OneSelect: No ajax configuration found');
            }
        },

        select: function(value) {
            var checkbox = this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"][value="' + value + '"]');
            if (checkbox.length) {
                checkbox.prop('checked', true);
                checkbox.closest('.cms-option').addClass('selected');
                this.updateSelectAllState();
                this.updateTriggerText();
                this.updateHiddenInputs();
            }
        },

        unselect: function(value) {
            var checkbox = this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"][value="' + value + '"]');
            if (checkbox.length) {
                checkbox.prop('checked', false);
                checkbox.closest('.cms-option').removeClass('selected');
                this.updateSelectAllState();
                this.updateTriggerText();
                this.updateHiddenInputs();
            }
        },

        selectAll: function() {
            this.handleSelectAll(true);
        },

        unselectAll: function() {
            this.handleSelectAll(false);
        },

        toggleSelection: function(value) {
            var checkbox = this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"][value="' + value + '"]');
            if (checkbox.length) {
                var isChecked = checkbox.prop('checked');
                checkbox.prop('checked', !isChecked);

                var option = checkbox.closest('.cms-option');
                if (!isChecked) {
                    option.addClass('selected');
                } else {
                    option.removeClass('selected');
                }

                this.updateSelectAllState();
                this.updateTriggerText();
                this.updateHiddenInputs();
            }
        },

        getInstanceId: function() {
            return this.instanceId;
        },

        destroy: function() {
            delete instances[this.instanceId];

            $(window).off('.cms');
            $(window).off('.ones');
            $(document).off('.onescroll');
            this.trigger.off();
            this.okBtn.off();
            this.cancelBtn.off();
            this.optionsContainer.off();

            // Clear horizontal scroll tracking interval
            if (this._horizontalScrollInterval) {
                clearInterval(this._horizontalScrollInterval);
                this._horizontalScrollInterval = null;
            }

            $('input.cms-hidden-input[data-cms-input="' + this.settings.name + '"]').remove();

            this.wrapper.remove();
            this.dropdown.remove();
            this.$element.removeData(pluginName);
        }
    };

    /**
     * Get instance by ID
     */
    OneSelect.getInstance = function(instanceId) {
        return instances[instanceId] || null;
    };

    /**
     * Get all instances
     */
    OneSelect.getAllInstances = function() {
        return instances;
    };

    /**
     * jQuery Plugin Registration
     */
    $.fn[pluginName] = function(options) {
        var args = arguments;
        var returnValue = this;

        this.each(function() {
            var $this = $(this);
            var instance = $this.data(pluginName);

            // Initialize if not already
            if (!instance) {
                // Don't auto-initialize - only init if options are provided
                if (typeof options === 'object' || !options) {
                    instance = new OneSelect(this, options);
                    $this.data(pluginName, instance);
                } else {
                    // Method called without initialization
                    return;
                }
            }

            // Call method
            if (typeof options === 'string') {
                if (options === 'value') {
                    if (args[1] !== undefined) {
                        instance.setValue(args[1]);
                        returnValue = $this;
                    } else {
                        returnValue = instance.getValue();
                    }
                } else if (options === 'getValues') {
                    returnValue = instance.getSelectedValues();
                } else if (options === 'getLabels') {
                    returnValue = instance.getSelectedLabels();
                } else if (options === 'getInstanceId') {
                    returnValue = instance.getInstanceId();
                } else if (options === 'updateData') {
                    instance.updateData(args[1]);
                } else if (options === 'loadData') {
                    instance.loadData(args[1], args[2], args[3]);
                } else if (options === 'reload') {
                    instance.reload();
                } else if (options === 'select') {
                    instance.select(args[1]);
                } else if (options === 'unselect') {
                    instance.unselect(args[1]);
                } else if (options === 'selectAll') {
                    instance.selectAll();
                } else if (options === 'unselectAll') {
                    instance.unselectAll();
                } else if (options === 'toggleSelection') {
                    instance.toggleSelection(args[1]);
                } else if (options === 'open') {
                    instance.open();
                } else if (options === 'close') {
                    instance.close();
                } else if (options === 'destroy') {
                    instance.destroy();
                }
            }
        });

        return returnValue;
    };

    // Expose constructor
    $.fn[pluginName].Constructor = OneSelect;

    // Expose static methods
    $.fn[pluginName].getInstance = OneSelect.getInstance;
    $.fn[pluginName].getAllInstances = OneSelect.getAllInstances;

}));

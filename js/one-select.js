/**
 * OneSelect - jQuery Multi-Select Dropdown Plugin
 * Version: 1.3.0
 * https://github.com/KamranBeylarov/one-select
 *
 * Copyright 2026
 * Licensed under MIT
 *
 * A powerful, flexible, and feature-rich multi-select dropdown component for jQuery.
 */

(function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = function (root, jQuery) {
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

}(function ($) {
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
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                func.apply(context, args);
            }, delay);
        };
    }

    /**
     * OneSelect Constructor
     * @param {HTMLElement} element - The DOM element
     * @param {Object} options - Configuration options
     */
    var OneSelect = function (element, options) {
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
        value: null,             // Single value or array of values to pre-select (index-based)
        showCheckbox: true,
        showBadges: false,
        showBadgesExternal: null,
        showSearch: false,       // Show search input in dropdown
        searchPlaceholder: 'Search...',
        searchUrl: null,         // URL for AJAX search (GET request)
        searchDebounceDelay: 300,// Delay in milliseconds for search debounce
        locale: 'az-AZ',         // Locale for case-insensitive search (e.g., 'en-US', 'tr-TR', 'az-AZ')
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
        onCancel: null,
        infinityScroll: false,
        onInfinityScroll: null,
        loading: false
    };

    /**
     * OneSelect Prototype
     */
    OneSelect.prototype = {
        /**
         * Read data attributes from HTML element
         */
        readDataAttributes: function () {
            var self = this;
            var dataOptions = {};

            var attributeMap = {
                'ones-placeholder': 'placeholder',
                'ones-select-all-text': 'selectAllText',
                'ones-ok-text': 'okText',
                'ones-cancel-text': 'cancelText',
                'ones-data': 'data',
                'ones-value': 'value',
                'ones-name': 'name',
                'ones-multiple': 'multiple',
                'ones-show-checkbox': 'showCheckbox',
                'ones-show-badges': 'showBadges',
                'ones-show-badges-external': 'showBadgesExternal',
                'ones-show-search': 'showSearch',
                'ones-search-placeholder': 'searchPlaceholder',
                'ones-search-url': 'searchUrl',
                'ones-search-debounce-delay': 'searchDebounceDelay',
                'ones-locale': 'locale',
                'ones-close-on-scroll': 'closeOnScroll',
                'ones-close-on-outside': 'closeOnOutside',
                'ones-submit-form': 'submitForm',
                'ones-submit-on-outside': 'submitOnOutside',
                'ones-form-id': 'formId',
                'ones-auto-load': 'autoLoad',
                'ones-infinity-scroll': 'infinityScroll'
            };

            $.each(attributeMap, function (attr, setting) {
                var value = self.$element.data(attr);

                if (value === undefined) {
                    return;
                }

                if (setting === 'data' || setting === 'value') {
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
                    setting === 'autoLoad' || setting === 'infinityScroll') {
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
                    // String URL olarak kullan, default GET method ile
                    dataOptions.ajax = {
                        url: ajaxData,
                        method: 'GET'
                    };
                } else if (typeof ajaxData === 'object') {
                    // Object olarak kullan (detaylı konfigürasyon için)
                    dataOptions.ajax = ajaxData;
                }
            }

            return dataOptions;
        },

        /**
         * Detect if current device is an Apple device
         * @returns {Boolean} True if Apple device (iOS, macOS, iPadOS)
         */
        isAppleDevice: function () {
            var isAppleDevice = navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
                               navigator.platform.toUpperCase().indexOf('IPHONE') >= 0 ||
                               navigator.platform.toUpperCase().indexOf('IPAD') >= 0 ||
                               navigator.userAgent.indexOf('Macintosh') !== -1;
            return isAppleDevice;
        },

        init: function () {
            // Register instance in global registry
            instances[this.instanceId] = this;

            // Convert value to array if needed and sanitize
            if (this.settings.value !== null && this.settings.value !== undefined) {
                if (!Array.isArray(this.settings.value)) {
                    this.settings.value = [this.settings.value];
                }

                // Remove null/undefined and duplicates
                var seen = {};
                this.settings.value = this.settings.value.filter(function (v) {
                    if (v === null || v === undefined) return false;
                    var strV = String(v).trim();
                    if (seen[strV]) return false;
                    seen[strV] = true;
                    return true;
                });
            } else {
                this.settings.value = [];
            }

            // Sync initial value to data attribute
            this.updateDataValueAttribute();

            // Initialize pagination state for infinity scroll
            this.currentPage = 1;
            this.hasNextPage = false;

            // Detect Apple device for horizontal scroll threshold
            this._isAppleDevice = this.isAppleDevice();

            this.wrapper = this.createWrapper();
            this.trigger = this.createTrigger();
            this.dropdown = this.createDropdown();
            this.searchInput = this.createSearchInput();
            this.optionsContainer = this.createOptionsContainer();
            this.preloader = this.createPreloader();
            this.buttons = this.createButtons();

            this.build();
            this.attachEvents();

            if (this.settings.ajax && this.settings.autoLoad) {
                this.loadData();
            }
        },

        build: function () {
            // Add search input at the top of dropdown if enabled
            if (this.settings.showSearch) {
                this.dropdown.append(this.searchInput);
            }
            this.dropdown.append(this.optionsContainer);
            this.dropdown.append(this.preloader);
            this.dropdown.append(this.buttons);
            this.wrapper.append(this.trigger);

            // Append wrapper to $element, dropdown to body
            this.$element.append(this.wrapper);
            $('body').append(this.dropdown);

            this.renderOptions();
            this.updateTriggerText();
            this.updateHiddenInputs();
        },

        updateHiddenInputs: function () {
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

            // Filter out null/undefined/empty to prevent backend errors
            if (Array.isArray(selectedValues)) {
                selectedValues = selectedValues.filter(function (v) {
                    return v !== null && v !== undefined && String(v).trim() !== '';
                });
            }

            if (this.settings.multiple) {
                if (selectedValues.length === 0) {
                    var hiddenInput = $('<input type="hidden" class="cms-hidden-input">')
                        .attr('name', this.settings.name)
                        .attr('value', '')
                        .attr('data-cms-input', this.settings.name);
                    container.append(hiddenInput);
                } else {
                    $.each(selectedValues, function (index, value) {
                        var hiddenInput = $('<input type="hidden" class="cms-hidden-input">')
                            .attr('name', inputName)
                            .attr('value', value)
                            .attr('data-cms-input', this.settings.name)
                            .attr('data-cms-value', value);
                        container.append(hiddenInput);
                    }.bind(this));
                }
            } else {
                var value = selectedValues.length > 0 ? selectedValues[0] : '';
                var hiddenInput = $('<input type="hidden" class="cms-hidden-input">')
                    .attr('name', inputName)
                    .attr('value', value)
                    .attr('data-cms-input', this.settings.name);
                container.append(hiddenInput);
            }
        },

        createWrapper: function () {
            return $('<div class="cms-wrapper"></div>');
        },

        createTrigger: function () {
            return $('<div class="cms-trigger"><span class="cms-selected-text cms-placeholder">' +
                this.settings.placeholder + '</span></div>');
        },

        createDropdown: function () {
            return $('<div class="cms-dropdown"></div>');
        },

        createSearchInput: function () {
            return $('<div class="cms-search-wrapper">' +
                '<input type="text" class="cms-search-input" placeholder="' +
                this.settings.searchPlaceholder + '" /></div>');
        },

        createOptionsContainer: function () {
            return $('<div class="cms-options-container"></div>');
        },

        createPreloader: function () {
            return $('<div class="cms-infinity-preloader"><div class="cms-spinner"></div></div>');
        },

        createButtons: function () {
            var container = $('<div class="cms-buttons"></div>');
            this.okBtn = $('<button class="cms-btn cms-btn-ok">' + this.settings.okText + '</button>');
            this.cancelBtn = $('<button class="cms-btn cms-btn-cancel">' + this.settings.cancelText + '</button>');

            container.append(this.okBtn);
            container.append(this.cancelBtn);

            return container;
        },

        renderOptions: function () {
            this.optionsContainer.empty();

            var selectAllOption = this.createOption('select-all', this.settings.selectAllText, false);
            this.optionsContainer.append(selectAllOption);

            var self = this;
            $.each(this.settings.data, function (key, label) {
                // For object: key = form value, label = display text
                // For array: key = index, label = item
                var value = key;
                var label = label;

                var isSelected = self.isValueSelected(value);
                var option = self.createOption(value, label, isSelected);
                self.optionsContainer.append(option);
            });

            this.updateSelectAllState();
        },
        htmlEncode: function (str) {
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },

        isValueSelected: function (value) {
            if (!this.settings.value) return false;
            if (Array.isArray(this.settings.value)) {
                var strValue = String(value).trim();
                return this.settings.value.some(function (v) {
                    return String(v).trim() === strValue;
                });
            }
            return String(this.settings.value).trim() === String(value).trim();
        },

        /**
         * Update the data-ones-value attribute to keep it in sync with settings.value
         * Removes attribute if value is empty, otherwise sets it to JSON array
         */
        updateDataValueAttribute: function () {
            if (!this.settings.value || this.settings.value.length === 0) {
                // Remove attribute completely when empty
                this.$element.removeAttr('data-ones-value');
            } else {
                // Update with current value as JSON
                this.$element.attr('data-ones-value', JSON.stringify(this.settings.value));
            }
        },

        /**
         * Append new options to existing list (for pagination)
         * @param {Object} data - New data to append
         */
        appendOptions: function (data) {
            var self = this;
            $.each(data, function (key, label) {
                var value = key;
                var label = label;

                // Check if option already exists
                var existingOption = self.optionsContainer.find('.cms-option[data-value="' + self.htmlEncode(value) + '"]');
                if (existingOption.length > 0) {
                    return; // Skip if already exists
                }

                var isSelected = self.isValueSelected(value);
                var option = self.createOption(value, label, isSelected);
                self.optionsContainer.append(option);
            });

            this.updateSelectAllState();
        },

        /**
         * Generate unique checkbox ID
         * @param {String} value - Option value
         * @returns {String} Unique ID
         */
        generateCheckboxId: function (value) {
            return 'cms-checkbox-' + this.instanceId + '-' + String(value).replace(/[^a-zA-Z0-9]/g, '-') + '-' + Math.random().toString(36).substr(2, 9);
        },

        createOption: function (value, label, checked) {
            var optionClass = 'cms-option';
            if (!this.settings.showCheckbox) {
                optionClass += ' cms-hide-checkbox';
            }

            if (checked && value !== 'select-all') {
                optionClass += ' selected';
            }

            // Generate unique checkbox ID
            var checkboxId = this.generateCheckboxId(value);

            var option = $('<div class="' + optionClass + '" data-value="' + this.htmlEncode(value) + '"></div>');
            var checkbox = $('<input type="checkbox" id="' + this.htmlEncode(checkboxId) + '" value="' + this.htmlEncode(value) + '"' +
                (checked ? ' checked' : '') + '>');
            var labelEl = $('<label for="' + this.htmlEncode(checkboxId) + '">' + label + '</label>');

            option.append(checkbox);
            option.append(labelEl);

            return option;
        },

        /**
         * Filter options based on search text
         * @param {String} searchText - Search text to filter by
         */
        filterOptions: function (searchText) {
            var self = this;
            var options = this.optionsContainer.find('.cms-option:not([data-value="select-all"])');

            if (searchText === '') {
                // Show all options if search is empty
                options.show();
            } else {
                // Filter options by label
                options.each(function () {
                    var option = $(this);
                    // Use configured locale for proper case-insensitive search
                    // This handles special characters correctly based on locale
                    // Examples: 'tr-TR' for Turkish, 'az-AZ' for Azerbaijani, 'en-US' for English
                    var label = option.find('label').text().toLocaleLowerCase(self.settings.locale);

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
        performAjaxSearch: function (searchText) {
            var self = this;

            // Show loading state
            this.optionsContainer.addClass('cms-loading');

            $.ajax({
                url: this.settings.searchUrl,
                method: 'GET',
                data: { q: searchText },
                dataType: 'json',
                success: function (response) {
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
                error: function (xhr, status, error) {
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
        updateSearchResults: function (data) {
            // Clear existing options (except select-all)
            this.optionsContainer.find('.cms-option:not([data-value="select-all"])').remove();

            var self = this;
            $.each(data, function (key, label) {
                // For object: key = form value, label = display text
                // For array: key = index, label = item
                var value = key;
                var label = label;

                var isSelected = self.isValueSelected(value);
                var option = self.createOption(value, label, isSelected);
                self.optionsContainer.append(option);
            });

            // Update select-all state
            this.updateSelectAllState();
        },

        attachEvents: function () {
            var self = this;

            this.trigger.on('click', function (e) {
                e.stopPropagation();
                self.toggle();
            });

            // Search input event listener
            if (this.settings.showSearch) {
                if (this.settings.searchUrl) {
                    // AJAX search with debounce
                    var debouncedSearch = debounce(function (searchText) {
                        self.performAjaxSearch(searchText);
                    }, this.settings.searchDebounceDelay);

                    this.searchInput.find('.cms-search-input').on('keyup', function () {
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
                    this.searchInput.find('.cms-search-input').on('keyup', function () {
                        // Use configured locale for proper case-insensitive search
                        var searchText = $(this).val().toLocaleLowerCase(self.settings.locale);
                        self.filterOptions(searchText);
                    });
                }
            }

            $(window).on('resize.cms', function () {
                if (self.wrapper.hasClass('open')) {
                    self.updateDropdownPosition();
                }
            });

            if (this.settings.closeOnScroll) {
                $(window).on('scroll.cms', function () {
                    if (self.wrapper.hasClass('open')) {
                        self.close();
                    }
                });
            } else {
                // Update dropdown position on vertical scroll
                $(window).on('scroll.cms', function () {
                    if (self.wrapper.hasClass('open')) {
                        self.updateDropdownPosition();
                    }
                });
            }

            // ============================================================================
            // HORIZONTAL SCROLL HANDLER - Close dropdown on horizontal scroll
            // ============================================================================

            // ============================================================================
            // OLD: wheel.onescroll event (DEPRECATED - Replaced with scroll capturing)
            // This approach only worked for wheel events (touchpad/mouse wheel)
            // and did NOT work for scrollbar drag, touch swipe, or keyboard scroll.
            //
            // var horizontalScrollThreshold = self._isAppleDevice ? 100 : 0;
            // $(document).on('wheel.onescroll', function (e) {
            //     if (!self.wrapper.hasClass('open')) {
            //         return;
            //     }
            //     if (e.originalEvent && Math.abs(e.originalEvent.deltaX) > horizontalScrollThreshold) {
            //         self.close();
            //     }
            // });
            // ============================================================================

            // NEW: Scroll capturing approach (covers ALL scroll methods)
            // Uses event capturing to intercept scroll events before they reach their target
            // This works for:
            // - Touchpad/mouse wheel horizontal scroll ✅
            // - Scrollbar drag ✅
            // - Touch swipe ✅
            // - Keyboard arrow keys ✅
            // - JavaScript scroll() ✅

            // Store scroll positions for delta calculation
            var scrollPositions = {};

            // Store accumulated horizontal delta for Apple devices
            // This tracks the total horizontal scroll distance across multiple scroll events
            // Stored on 'self' so it can be reset when dropdown opens/closes
            self._accumulatedHorizontalDelta = 0;

            // Set threshold based on device type
            // Apple devices: 100px threshold (to avoid accidental closure from trackpad gestures)
            // Other devices: 0px threshold (immediate closure on any horizontal scroll)
            var horizontalScrollThreshold = self._isAppleDevice ? 100 : 0;

            // Scroll event handler with capturing
            var scrollHandler = function (e) {
                // Only act if dropdown is open
                if (!self.wrapper.hasClass('open')) {
                    // Dropdown closed - just update scroll positions for next time
                    scrollPositions[e.target] = {
                        left: e.target.scrollLeft,
                        top: e.target.scrollTop
                    };
                    return;
                }

                var target = e.target;

                // ========================================================================
                // IMPORTANT: Ignore scroll events from INSIDE the dropdown
                // ========================================================================
                // When user scrolls through dropdown options (.cms-options-container),
                // we should NOT close the dropdown. Only close when OUTSIDE elements scroll.
                // ========================================================================
                var isInsideDropdown = $(target).closest('.cms-dropdown, .cms-wrapper').length > 0;
                if (isInsideDropdown) {
                    // This scroll is happening inside the dropdown - IGNORE it
                    // User is just scrolling through options, don't close the dropdown
                    scrollPositions[target] = {
                        left: target.scrollLeft,
                        top: target.scrollTop
                    };
                    return;
                }
                // ========================================================================

                // Check if target is scrollable
                // If element has no scrollable content, ignore this event
                if (target.scrollWidth <= target.clientWidth &&
                    target.scrollHeight <= target.clientHeight) {
                    return;
                }

                // Get previous scroll position
                var prevPos = scrollPositions[target];

                if (!prevPos) {
                    // First scroll event for this element - store position and wait
                    scrollPositions[target] = {
                        left: target.scrollLeft,
                        top: target.scrollTop
                    };
                    return;
                }

                // Calculate scroll deltas
                var currentScrollLeft = target.scrollLeft;
                var currentScrollTop = target.scrollTop;
                var horizontalDelta = Math.abs(currentScrollLeft - prevPos.left);
                var verticalDelta = Math.abs(currentScrollTop - prevPos.top);

                // ONLY respond to HORIZONTAL scroll (ignore vertical scroll)
                // Vertical scroll should NOT close the dropdown
                if (horizontalDelta === 0) {
                    // Only vertical scroll occurred - update position and continue
                    scrollPositions[target] = {
                        left: currentScrollLeft,
                        top: currentScrollTop
                    };
                    return;
                }

                // ====================================================================
                // HORIZONTAL SCROLL DETECTED - Handle differently for Apple vs others
                // ====================================================================
                if (self._isAppleDevice) {
                    // APPLE DEVICES: Accumulate delta across multiple scroll events
                    // Trackpad gestures produce many small scroll events (momentum scrolling)
                    // We need to accumulate these small deltas to reach the 100px threshold
                    self._accumulatedHorizontalDelta += horizontalDelta;

                    if (self._accumulatedHorizontalDelta > horizontalScrollThreshold) {
                        // Total accumulated scroll exceeded 100px - close dropdown
                        self.close();
                        return;
                    }
                    // Threshold not yet reached - continue accumulating
                } else {
                    // OTHER DEVICES (Windows, Linux, Android): Close immediately
                    // No need for accumulation - close on first horizontal scroll
                    if (horizontalDelta > horizontalScrollThreshold) {
                        self.close();
                        return;
                    }
                }
                // ====================================================================

                // Update position for next scroll
                scrollPositions[target] = {
                    left: currentScrollLeft,
                    top: currentScrollTop
                };
            };

            // Attach scroll listener using event CAPTURING phase
            // The 'true' parameter enables capturing mode
            // This allows us to intercept scroll events even if they don't bubble
            document.addEventListener('scroll', scrollHandler, true);

            // Store handler reference for cleanup in destroy() method
            self._scrollHandler = scrollHandler;
            // ============================================================================


            // Window click handler - close dropdown when clicking outside
            $(window).on('click.ones', function (e) {
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

            this.optionsContainer.on('click', '.cms-option', function (e) {
                var $target = $(e.target);

                // If clicking label or checkbox, browser already handles toggle
                if ($target.is('input[type="checkbox"]') || $target.closest('label').length > 0 || $target.closest('button').length > 0) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                var option = $(this);
                var checkbox = option.find('input[type="checkbox"]');
                checkbox.prop('checked', !checkbox.prop('checked')).trigger('change');
            });

            this.optionsContainer.on('change', 'input[type="checkbox"]', function (e) {
                e.stopPropagation();
                var checkbox = $(this);
                var option = checkbox.closest('.cms-option');
                var value = option.data('value');

                if (value === 'select-all') {
                    self.handleSelectAll(checkbox.prop('checked'));
                } else {
                    self.handleOptionChange(option);
                }
            });

            this.okBtn.on('click', function (e) {
                e.stopPropagation();
                self.handleOk();
            });

            this.cancelBtn.on('click', function (e) {
                e.stopPropagation();
                self.handleCancel();
            });

            // Infinity Scroll with Debounce - only activate if AJAX is configured
            if (this.settings.infinityScroll && this.settings.ajax && this.settings.ajax.url) {
                var debouncedScroll = debounce(function () {
                    // Check if we have more pages to load
                    if (!self.hasNextPage) {
                        return;
                    }

                    if (!self.settings.loading) {  // Double check loading state
                        self.loadNextPage();
                    }
                }, 200); // 200ms debounce delay

                this.optionsContainer.on('scroll', function () {
                    var container = $(this);
                    if (container.scrollTop() + container.innerHeight() >= container[0].scrollHeight - 50) {
                        debouncedScroll();
                    }
                });
            }

            // Legacy onInfinityScroll callback support (deprecated)
            if (this.settings.infinityScroll && this.settings.onInfinityScroll && !this.settings.ajax) {
                console.warn('OneSelect: infinityScroll requires ajax configuration. onInfinityScroll callback is deprecated.');
            }
        },

        handleOptionChange: function (option) {
            var value = option.data('value');
            var checkbox = option.find('input[type="checkbox"]');
            var isChecked = checkbox.prop('checked');

            if (isChecked) {
                this.select(value);
            } else {
                this.unselect(value);
            }

            if (this.settings.onChange) {
                this.settings.onChange.call(this, this.getSelectedValues(), this.getSelectedLabels());
            }

            if (this.settings.onSelect) {
                this.settings.onSelect.call(this, this.getSelectedValues());
            }
        },

        handleSelectAll: function (checked) {
            var self = this;
            if (!checked) {
                // Clear all selection (including hidden ones)
                if (Array.isArray(this.settings.value)) {
                    this.settings.value = [];
                }
            }

            this.optionsContainer.find('.cms-option:not([data-value="select-all"])').each(function () {
                var option = $(this);
                option.find('input[type="checkbox"]').prop('checked', checked);
                if (checked) {
                    option.addClass('selected');
                    // Add to settings.value if not exists
                    var val = option.find('input[type="checkbox"]').val();
                    if (Array.isArray(self.settings.value)) {
                        if (!self.isValueSelected(val)) {
                            self.settings.value.push(val);
                        }
                    }
                } else {
                    option.removeClass('selected');
                }
            });

            this.updateSelectAllState();
            this.updateTriggerText();
            this.updateHiddenInputs();
            this.updateDataValueAttribute();
        },

        updateSelectAllState: function () {
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

        getSelectedValues: function () {
            // Return unique sanitized settings.value
            if (!Array.isArray(this.settings.value)) {
                return [];
            }
            return this.settings.value;
        },

        getSelectedLabels: function () {
            var labels = [];
            this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"]:checked')
                .siblings('label')
                .each(function () {
                    labels.push($(this).text());
                });
            return labels;
        },

        updateTriggerText: function () {
            var labels = this.getSelectedLabels();
            var values = this.getSelectedValues();
            var totalCount = this.settings.value ? this.settings.value.length : 0;

            var textSpan = this.trigger.find('.cms-selected-text');

            if (labels.length === 0) {
                textSpan.empty().text(this.settings.placeholder).addClass('cms-placeholder');
            } else if (this.settings.showBadges) {
                textSpan.empty().removeClass('cms-placeholder');

                var self = this;
                var self = this;
                $.each(values, function (index, value) {
                    var badge = $('<span class="cms-badge"></span>');

                    // Find label from DOM (if exists) or fallback to value
                    var labelText = value;
                    var option = self.optionsContainer.find('.cms-option[data-value="' + self.htmlEncode(value) + '"]');
                    if (option.length) {
                        labelText = option.find('label').text();
                    }

                    var labelSpan = $('<span></span>').text(labelText);
                    var removeBtn = $('<button type="button" class="cms-badge-remove">&times;</button>');

                    removeBtn.on('click', function (e) {
                        e.stopPropagation();
                        self.unselect(value);
                    });

                    badge.append(labelSpan);
                    badge.append(removeBtn);
                    textSpan.append(badge);
                });
            } else {
                textSpan.empty().removeClass('cms-placeholder');
                textSpan.text(totalCount + ' items selected');
            }

            this.updateExternalBadges(values, labels);
        },

        updateExternalBadges: function (values, labels) {
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
            $.each(values, function (index, value) {
                var badge = $('<span class="cms-badge"></span>');
                var labelSpan = $('<span></span>').text(labels[index]);
                var removeBtn = $('<button type="button" class="cms-badge-remove">&times;</button>');

                removeBtn.on('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.unselect(value);
                });

                badge.append(labelSpan);
                badge.append(removeBtn);
                $externalContainer.append(badge);
            });
        },

        toggle: function () {
            if (this.wrapper.hasClass('open')) {
                this.close();
            } else {
                this.open();
            }
        },

        open: function () {
            // Reset accumulated horizontal delta when dropdown opens
            // This ensures a clean slate for tracking horizontal scroll distance
            this._accumulatedHorizontalDelta = 0;

            // Close other open dropdowns
            $('.cms-wrapper.open').not(this.wrapper).removeClass('open');
            $('.cms-dropdown.open').not(this.dropdown).removeClass('open');

            // Calculate position
            this.updateDropdownPosition();

            this.wrapper.addClass('open');
            this.dropdown.addClass('open');
        },

        updateDropdownPosition: function () {
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

        close: function () {
            // Reset accumulated horizontal delta when dropdown closes
            this._accumulatedHorizontalDelta = 0;

            this.wrapper.removeClass('open');
            this.dropdown.removeClass('open');
        },

        handleOk: function () {
            this.updateTriggerText();

            var values = this.getSelectedValues();
            var labels = this.getSelectedLabels();

            if (this.settings.onOk) {
                this.settings.onOk.call(this, values, labels);
            }

            if (this.settings.submitForm) {
                this.submitForm();
            }

            this.updateDataValueAttribute();
            this.close();
        },

        submitForm: function () {
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

        handleCancel: function () {
            this.settings.value = [];
            this.optionsContainer.find('input[type="checkbox"]').prop('checked', false);
            this.optionsContainer.find('.cms-option').removeClass('selected');
            this.updateSelectAllState();
            this.updateTriggerText();
            this.updateHiddenInputs();
            this.updateDataValueAttribute();

            if (this.settings.onCancel) {
                this.settings.onCancel.call(this);
            }

            if (this.settings.submitForm) {
                this.submitForm();
            }

            this.close();
        },

        setValue: function (values) {
            this.settings.value = values || [];
            this.renderOptions();
            this.updateTriggerText();
            this.updateHiddenInputs();
            this.updateDataValueAttribute();
        },

        getValue: function () {
            return this.getSelectedValues();
        },

        updateData: function (data) {
            this.settings.data = data || [];
            this.settings.value = [];
            this.renderOptions();
            this.updateTriggerText();
            this.updateHiddenInputs();
            this.updateDataValueAttribute();
        },

        loadData: function (customAjaxConfig, onSuccess, onError, appendData) {
            var self = this;
            var ajaxConfig = customAjaxConfig || this.settings.ajax;

            if (!ajaxConfig || !ajaxConfig.url) {
                console.error('OneSelect: Ajax configuration or url is missing');
                return;
            }

            if (this.settings.beforeLoad) {
                this.settings.beforeLoad.call(this, ajaxConfig);
            }

            if (!appendData) {
                this.trigger.find('.cms-selected-text').text('Loading...');
            }

            var request = $.extend(true, {
                url: ajaxConfig.url,
                method: ajaxConfig.method || 'GET',
                data: ajaxConfig.data || {},
                dataType: ajaxConfig.dataType || 'json',
                success: function (response) {
                    var data = response;
                    if (typeof response === 'object' && response.data) {
                        data = response.data;
                    } else if (typeof response === 'object' && response.results) {
                        data = response.results;
                    }

                    // Handle hasNextPage from response
                    if (response && typeof response.hasNextPage !== 'undefined') {
                        self.hasNextPage = response.hasNextPage;
                    } else {
                        self.hasNextPage = false;
                    }

                    // Handle currentPage from response (optional)
                    if (response && typeof response.currentPage !== 'undefined') {
                        self.currentPage = response.currentPage;
                    }

                    // Append or replace data
                    if (appendData) {
                        // Merge new data with existing data
                        self.settings.data = $.extend({}, self.settings.data, data || {});
                        self.appendOptions(data || {});
                    } else {
                        self.settings.data = data || [];
                        self.renderOptions();
                    }

                    self.updateTriggerText();

                    if (self.settings.afterLoad) {
                        self.settings.afterLoad.call(self, data, response);
                    }

                    if (onSuccess) {
                        onSuccess.call(self, data, response);
                    }
                },
                error: function (xhr, status, error) {
                    if (!appendData) {
                        self.trigger.find('.cms-selected-text').text('Error loading data');
                    }

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
                request.success = function (response) {
                    ajaxConfig.success(response);
                    originalSuccess(response);
                };
            }

            if (ajaxConfig.error) {
                var originalError = request.error;
                request.error = function (xhr, status, error) {
                    ajaxConfig.error(xhr, status, error);
                    originalError(xhr, status, error);
                };
            }

            $.ajax(request);
        },

        loadNextPage: function () {
            var self = this;
            this.settings.loading = true;
            this.preloader.show();

            var ajaxConfig = $.extend(true, {}, this.settings.ajax);
            ajaxConfig.data = ajaxConfig.data || {};
            ajaxConfig.data.page = this.currentPage + 1;

            this.loadData(ajaxConfig, function (data, response) {
                self.settings.loading = false;
                self.preloader.hide();

                if (!response.currentPage) {
                    self.currentPage++;
                }
            }, function () {
                self.settings.loading = false;
                self.preloader.hide();
            }, true);
        },

        reload: function () {
            if (this.settings.ajax) {
                this.loadData();
            } else {
                console.warn('OneSelect: No ajax configuration found');
            }
        },

        select: function (value) {
            var self = this;
            var checkbox = this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"][value="' + this.htmlEncode(value) + '"]');

            if (checkbox.length) {
                checkbox.prop('checked', true);
                checkbox.closest('.cms-option').addClass('selected');
            }

            if (Array.isArray(this.settings.value)) {
                if (!this.isValueSelected(value)) {
                    this.settings.value.push(value);
                }
            }

            this.updateSelectAllState();
            this.updateTriggerText();
            this.updateHiddenInputs();
            this.updateDataValueAttribute();
        },

        unselect: function (value) {
            var self = this;
            var checkbox = this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"][value="' + this.htmlEncode(value) + '"]');

            if (checkbox.length) {
                checkbox.prop('checked', false);
                checkbox.closest('.cms-option').removeClass('selected');
            }

            if (Array.isArray(this.settings.value)) {
                var strValue = String(value).trim();
                this.settings.value = this.settings.value.filter(function (v) {
                    return String(v).trim() !== strValue;
                });
            }

            this.updateSelectAllState();
            this.updateTriggerText();
            this.updateHiddenInputs();
            this.updateDataValueAttribute();
        },

        selectAll: function () {
            this.handleSelectAll(true);
        },

        unselectAll: function () {
            this.handleSelectAll(false);
        },

        toggleSelection: function (value) {
            var checkbox = this.optionsContainer.find('.cms-option:not([data-value="select-all"]) input[type="checkbox"][value="' + this.htmlEncode(value) + '"]');
            if (checkbox.length) {
                var isChecked = checkbox.prop('checked');
                checkbox.prop('checked', !isChecked);

                var option = checkbox.closest('.cms-option');
                if (!isChecked) {
                    option.addClass('selected');
                    if (Array.isArray(this.settings.value)) {
                        if (!this.isValueSelected(value)) {
                            this.settings.value.push(value);
                        }
                    }
                } else {
                    option.removeClass('selected');
                    if (Array.isArray(this.settings.value)) {
                        var strValue = String(value).trim();
                        this.settings.value = this.settings.value.filter(function (v) { return String(v).trim() !== strValue });
                    }
                }

                this.updateSelectAllState();
                this.updateTriggerText();
                this.updateHiddenInputs();
            }
        },

        getInstanceId: function () {
            return this.instanceId;
        },

        destroy: function () {
            delete instances[this.instanceId];

            $(window).off('.cms');
            $(window).off('.ones');
            $(document).off('.onescroll');

            // Remove scroll capturing listener
            if (this._scrollHandler) {
                document.removeEventListener('scroll', this._scrollHandler, true);
                this._scrollHandler = null;
            }

            // Clean up accumulated horizontal delta
            this._accumulatedHorizontalDelta = null;

            this.trigger.off();
            this.okBtn.off();
            this.cancelBtn.off();
            this.optionsContainer.off();

            $('input.cms-hidden-input[data-cms-input="' + this.settings.name + '"]').remove();

            this.wrapper.remove();
            this.dropdown.remove();
            this.$element.removeData(pluginName);
        }
    };

    /**
     * Get instance by ID
     */
    OneSelect.getInstance = function (instanceId) {
        return instances[instanceId] || null;
    };

    /**
     * Get all instances
     */
    OneSelect.getAllInstances = function () {
        return instances;
    };

    /**
     * jQuery Plugin Registration
     */
    $.fn[pluginName] = function (options) {
        var args = arguments;
        var returnValue = this;

        this.each(function () {
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

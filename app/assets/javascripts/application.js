//
//= require jquery
//= require jquery_ujs
//= require jquery.cookie
//= require jquery.form
//= require jquery.observe_field
//= require jquery.hoverIntent.minified
//= require jquery.ba-bbq.min
//= require jquery-ui-1.9.2.custom.min
//= require jquery.bt
//= require jquery.bootpag.min
//= require jquery.masonry.min
//= require jquery.ba-detach
//= require jquery.infinitescroll.min
//= require ckeditor-setup
//= require ckeditor/ckeditor
//= require modernizr.custom.15012
//= require jquery.sortChildren
//= require bootstrap-sprockets
//= require select2
//= require_tree .
//
( function($){

	$.extend({
		rootPath: function(){
			return '/';
    },
    showSpinner: function(){
      $('#spinner').show();
    },
    hideSpinner: function(){
      $('#spinner').hide();
    }, 
    processReturnCookie: function(){
      var anchor = document.cookie.match('(^|;) ?return_to=([^;]*)(;|$)');
        if (anchor != null) {
         if (anchor[2] != undefined && anchor[2] != "") {
          $('html, body').animate({
            scrollTop: $('a[name="' + anchor[2] + '"]').offset().top
          }, 0);
          document.cookie = 'return_to=';
          }
        }
    },
    showMajorError: function(jqXHR,textStatus,errorThrown){
      if (window.console && console.log){
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      }
      if(errorThrown != '' && textStatus != 'abort'){
        $('<div></div>').html("There appears to have been an error.<br/><p class='error'>" + jqXHR.responseText + '</p>').dialog({
          modal: true
          }).dialog({modal: true, width: 700, height: 'auto'}).dialog('open');
        }
    },
    initPerPage: function(){
      $('.per_page_selector').val($.cookie('per_page') || 25);
    },
    observeListPagination: function(){
      if($('.search_results,.ui-widget-content').length > 0){
        // Only allow ajax-y stuff when actually in ajax-y context.
        $('.pagination a').live('click',function(e){
          var paginationTarget = $(this).closest('.search_results,.ui-widget-content');
          if (paginationTarget.length > 0) {
            e.preventDefault();
            $.ajax({
              type: 'GET',
              url: $(this).attr('href'),
              dataType: 'html',
              beforeSend: function(){
                $.showSpinner();
              },
              success: function(html){
                $(paginationTarget).html(html);
              }
            });
          }
        });
        $('.per_page_selector').live('change', function(e){
          e.preventDefault();
          $.cookie('per_page',$(this).val(), {expires: 365, path: $.rootPath()});
          var paginationTarget = $(this).closest('.search_results,.ui-widget-content');
          var paginationLink = $(this).parent().prev().find('a').first().attr('href').replace(/page=\d+/,'page=1');
          if (! paginationLink.match(/page=\d+/)){
            paginationLink = paginationLink + "&page=1";
          }
          $.ajax({
            type: 'GET',
            url: paginationLink,
            dataType: 'html',
            beforeSend: function(){
              $.showSpinner();
            },
            success: function(html){
              $(paginationTarget).html(html);
            }
          });
        });
      }
    },
    observeDialogShow: function(rootClass){
      $(rootClass).live('click',function(e){
        e.preventDefault();
        var windowTitle = $(this).attr('title');
        $.ajax({
          dataType: 'html',
          url: $(this).attr('href'),
          success: function(html){
            var dialogNode = $('<div><div class="dialog-error alert alert-danger" style="display:none;"></div><div class="dialog-notice alert alert-info" style="display:none;"></div></div>');
            $(dialogNode).append(html);
            $(dialogNode).dialog({
              modal: true,
              width: 600,
              minWidth: 400,
              height: 'auto',
              title: windowTitle,
            });
            $('.tabs').tabs({
              cookie: {
                expires: 3
              },
              beforeLoad: function(){
                $.showSpinner();
              },
              ajaxOptions: {
                dataType: 'html',
                complete: function(){
                  $.checkPlaceholders();
                  $.initPerPage();
                  $.hideSpinner();
                  $.initTabHistory('.tabs');
                },
                error: function(jqXHR,textStatus,errorThrown){
                  $.showMajorError(jqXHR,textStatus,errorThrown);
                }
              }
            });
          }
        });
      });
    },
    submitTagFilter: function(href,filter_type,tag_id,new_tag,modify_tag){
      $.ajax({
        dataType: 'html',
        cache: false,
        url: href,
        type: 'post',
        data: {filter_type: filter_type, tag_id: tag_id, new_tag: new_tag, modify_tag: modify_tag},
        success: function(html){
          window.location.reload();
        }
      });
    },
    bindHoverRows: function(){
/*      $('.hover_row').hoverIntent(
        function(){
          $(this).addClass('over');
        },
        function(){
          $(this).removeClass('over');
        }
        ); */
       $('.hover_row').live({
         mouseover: function(){
           $(this).addClass('over');
         },
         mouseout: function(){
           $(this).removeClass('over');
         }
       });
    },
    observeTagCloudControls: function(){
      var sort_tags_on_change = function(e){
        var sort_by = $('#sort-tags-by').val();
        var sort = $("#sort-tags-direction").val();
        var mapping_function = function(elem) {
          var tag_frequency = $(elem).find('.tag').data('tag-frequency'),
              tag_text = $(elem).find('.tag').data('tag-name'),
              attributes = {};

          attributes.frequency = tag_frequency;
          attributes.name = tag_text.toString();

          return attributes;
        };
        var compare_function = function(a,b) {
            if(sort_by == "frequency" && sort == "desc") {
              return (b.value.frequency - a.value.frequency) || (b.value.frequency === a.value.frequency && a.value.name.localeCompare(b.value.name));
            }
            else if(sort_by == "frequency" && sort == "asc") {
              return (a.value.frequency - b.value.frequency) || (b.value.frequency === a.value.frequency && a.value.name.localeCompare(b.value.name));
            }
            else if(sort_by == "alpha" && sort == "asc") {
              return a.value.name.localeCompare(b.value.name);
            }
            else if(sort_by == "alpha" && sort == "desc") {
              return b.value.name.localeCompare(a.value.name);
            }
            else {
              return null;
            }
        };
        $("#tag-cloud").detach(function() {
          $(this).sortChildren(mapping_function, compare_function);
        });
      };
      $('#sort-tags-by').change(sort_tags_on_change);
      $('#sort-tags-direction').change(sort_tags_on_change);

      $('#reset-filter').click(function(e){
        $('#tag-cloud li').show();
        $('#filter-by').val('');
      });

      var filterStuff = function(e){
        if(e != ''){
          e.preventDefault();
        }
        $('#tag-cloud li').show();
        var filterVal = $('#filter-by').val();
        var filterregex = new RegExp(filterVal,'i');
        $('#tag-cloud li').each(function(){
          if(! $(this).find('.tag').html().match(filterregex)){
            $(this).hide();
          }
        });
      };

      $('#filter-button').click(filterStuff);
      $('#filter-by').observe_field(1,filterStuff);

      $('#tag_slider').slider({
        value: 0,
        min: 0,
        max: 9,
        step: 1,
        slide: function(event, ui){
          $('.tag').show();
          for(var i = 1; i <= ui.value; i=i+1){
            $('.s' + i).hide();
          }
        }
      });
    },
    initEditor: function(textArea){
      CKEDITOR.replace(textArea);
    },
    initBookmarkCollectionChoices: function(hubChoiceId){
      $.cookie('bookmarklet_hub_choice', hubChoiceId, {expires: 365, path: $.rootPath()});
      $.ajax({
        type: 'GET',
        cache: false,
        url: $.rootPath() + 'hubs/' + hubChoiceId + '/my_bookmark_collections',
        dataType: 'json',
        success: function(json){
          $('#feed_item_bookmark_collection_id_input').show();
          $('#feed_item_bookmark_collection_id').html('');
          if (json.feeds.length > 0) {
          $(json.feeds).each(function(i,bookmarkCollectionObj){
            $('#feed_item_bookmark_collection_id').append(
              $('<option />').attr({value: bookmarkCollectionObj.id}).text(bookmarkCollectionObj.title)
            );
          });
          } else {
            $('#feed_item_bookmark_collection_id').append(
              $('<option />').attr({value: ''}).text('<New Collection>')
            );
          }

          if($.cookie('bookmarklet_bookmark_collection_id_choice') != undefined ){
            $('#feed_item_bookmark_collection_id').val($.cookie('bookmarklet_bookmark_collection_id_choice'));
          }

          $('#feed_item_bookmark_collection_id').change(function(){
            $.cookie('bookmarklet_bookmark_collection_id_choice', $(this).val(), {expires: 365, path: $.rootPath()});
          });

          $.observeSearchSelectControl();

          function split( val ) {
            return val.split( /,\s*/ );
          }
          function extractLast( term ) {
            return split( term ).pop();
          }

          $( "#feed_item_tag_list" )
          .bind( "keydown", function( event ) {
            if ( event.keyCode === $.ui.keyCode.TAB &&
            $( this ).data( "autocomplete" ).menu.active ) {
              event.preventDefault();
            }
          })
          .autocomplete({
            source: function( request, response ) {
              $.getJSON( $.rootPath() + 'hubs/' + hubChoiceId + '/tags/autocomplete', {
                term: extractLast( request.term )
              }, response );
            },
            search: function() {
              // custom minLength
              var term = extractLast( this.value );
              if ( term.length < 2 ) {
                return false;
              }
            },
            focus: function() {
              // prevent value inserted on focus
              return false;
            },
            select: function( event, ui ) {
              var terms = split( this.value );
              // remove the current input
              terms.pop();
              // add the selected item
              terms.push( ui.item.value );
              // add placeholder to get the comma-and-space at the end
              terms.push( "" );
              this.value = terms.join( ", " );
              return false;
            }
          });

        }
      });
    },
    initHubFeedItemTagList: function(hubId, feedItemId) {
      $('.feed-item-existing-tags').empty();
      if (feedItemId >= 0) {
        $.ajax({
          type: 'GET',
          cache: false,
          url: $.rootPath() + 'hubs/' + hubId + '/feed_items/' +
          feedItemId + '/tag_list',
          success: function(tagList){
            if ($(tagList).find('a').length > 0) {
              $('.feed-item-existing-tags').append(
                '<p class="control-label">Existing Tags</p>' + tagList);
            }
          }
        });
      }
    },
    observeHubSelector: function(feedItemId){
      if($.cookie('bookmarklet_hub_choice') != undefined){
        // A selection! Set the defaults.
        $('#feed_item_hub_id').val($.cookie('bookmarklet_hub_choice'));
      }
      $.initBookmarkCollectionChoices($('#feed_item_hub_id').val());
      $.initHubFeedItemTagList($('#feed_item_hub_id').val(), feedItemId);
      $('#feed_item_hub_id').change(function() {
        $.initBookmarkCollectionChoices($(this).val());
        $.initHubFeedItemTagList($(this).val(), feedItemId);
      });
    },
    initBookmarklet: function(feedItemId){
      $('#feed_item_bookmark_collection_id_input').hide();
      $.observeHubSelector(feedItemId);
      $('.bookmarklet_tabs').tabs();
      $('.datepicker').datepicker({
        changeMonth: true,
        changeYear:true,
        changeDay: true,
        yearRange: 'c-500',
        dateFormat: 'yy-mm-dd'
      });
    },
    checkPlaceholders: function(){
      if(!Modernizr.input.placeholder){
        $('[placeholder]').focus(function() {
          var input = $(this);
          if (input.val() == input.attr('placeholder')) {
            input.val('');
            input.removeClass('placeholder');
          }
        }).blur(function() {
          var input = $(this);
          if (input.val() == '' || input.val() == input.attr('placeholder')) {
            input.addClass('placeholder');
            input.val(input.attr('placeholder'));
          }
        }).blur();
        $('[placeholder]').parents('form').submit(function() {
          $(this).find('[placeholder]').each(function() {
            var input = $(this);
            if (input.val() == input.attr('placeholder')) {
              input.val('');
            }
          })
        });
      }
    },
    refreshBackgroundActivity: function(){
      $.ajax({
        url: $.rootPath() + 'hubs/background_activity',
        dataType: 'json',
        cache: false,
        success: function(json){
          $('#activity').html('');
          if(json.running.length == 0){
            $('#activity').html('<p>No background jobs are currently running.</p>');
          } else {
            $('#activity').html('<ul></ul>');
            $(json.running).each(function(i,job){
              $('#activity ul').append('<li>' + job.description + ' since "' + job.since + '", running for ' + job.running_for + '</li>');
            });
            if(json.queued > 0){
              $('#activity ul').append('<li>' + json.queued + ' more jobs queued' + '</li>')
            }
          }
        }
      });
    },
    initTabHistory: function(tabClass){
      if($(tabClass).length > 0){
        var tabs = $(tabClass);
        var tab_a_selector = 'ul.ui-tabs-nav a';
        tabs.tabs({ event: 'change' });
        tabs.find( tab_a_selector ).click(function(){
          var state = {};
          id = $(this).closest( tabClass ).attr( 'id' );
          idx = $(this).parent().prevAll().length;
          state[ id ] = idx;
          $.bbq.pushState( state );
        });

        $(window).bind( 'hashchange', function(e) {
          tabs.each(function(){
            var idx = $.bbq.getState( this.id, true ) || 0;
            $(this).find( tab_a_selector ).eq( idx ).triggerHandler( 'change' );
          });
        });
      }
    },
    simpleClassFilter: function(filterContainer,objectSelector){

      $('.filter_control').live({click: function(){
        $(objectSelector + '.' + $(this).attr('id')).toggle();
      }});
      $('#reset-filter').live({click: function(){
        $(objectSelector).show();
      }});

      var classesOfImport = {};
      $(objectSelector).each(function(){
        classesOfImport[$(this).attr('class')] = 1;
      });
      $.each(classesOfImport,function(key,value){
        $(filterContainer).append($('<span/> ').attr({id: key, 'class': 'filter_control'}).html(key + ' '));
      });

      $(filterContainer).append($('<span/> ').attr({id: 'reset-filter' }).html("<strong>Show all</strong>"));


    },

});

})(jQuery);


$(document).ready(function(){
  $('#pagination').bootpag({total:$("#pagination").attr("data-total-pages"), maxVisible:5}).on("page", function(event, num){
     var paginationTarget = $(this).closest("#pagination").siblings('.search_results,.ui-widget-content');
     event.stopPropagation();
     event.preventDefault();
            $.ajax({
              type: 'GET',
              url: "?page=" + num,
              dataType: 'html',
              beforeSend: function(){
                $.showSpinner();
              },
              success: function(html){
                $(paginationTarget).html(html);
              }
            });
  });

    var container = $('#masonry');
    if (container.length > 0) {
      container.masonry({
          itemSelector: '.hub'
       });
      container.infinitescroll({
        navSelector  : '#page-nav',    // selector for the paged navigation
        nextSelector : '#page-nav a',  // selector for the NEXT link (to page 2)
        itemSelector : '.hub',     // selector for all items you'll retrieve
        loading: {
         finishedMsg: '',
         msgText: '' 
        },
        errorCallback: function(){
          $.hideSpinner();
        }
       }, function( newElements ) {
         var newElems = $(newElements).css({ opacity: 0 });
         newElems.animate({ opacity: 1 });
         container.masonry( 'appended', newElems, true );
         $.hideSpinner();
       }
      );
    }
  $.initTabHistory('.tabs');
  $(window).trigger( 'hashchange' );
  if($('#user_role_list').length > 0){
    $.simpleClassFilter('#user_role_filter_container','#user_role_list li');
  }

  $('#background_jobs').click(function(e){
    e.preventDefault();
    var dialogNode = $('<div><div id="activity"></div></div>');
    $(dialogNode).dialog({
      modal: true,
      height: 'auto',
      width: 600,
      title: 'Background jobs running in this TagTeam',
      create: function(){
        $.refreshBackgroundActivity();
      },
      buttons: [
        {
          text: 'Refresh',
          click: function(){ $.refreshBackgroundActivity(); },
          class: 'btn btn-primary'
        },
        {
          text: 'Close',
          click: function(){
            $(dialogNode).dialog('close');
            $(dialogNode).remove();
          },
          class: 'btn btn-primary'
        }
      ]
    });
  });

  $.checkPlaceholders();


  $.ajaxSetup({
    beforeSend: function(){
      $.showSpinner();
    },
    complete: function(){
      $.initPerPage();
      $.hideSpinner();
    },
    error: function(jqXHR,textStatus,errorThrown){
      $.showMajorError(jqXHR,textStatus,errorThrown);
    }
  });

  jQuery.bt.options.ajaxCache = false;
  jQuery.bt.options.fill = '#525252';
  jQuery.bt.options.strokeWidth = 0;
  jQuery.bt.options.spikeGirth = 20;
  jQuery.bt.options.spikeLength = 12;
  jQuery.bt.options.strokeStyle = '#999';
  jQuery.bt.options.padding = '0';
  jQuery.bt.options.width = '235px';
  jQuery.bt.options.textzIndex = 999;
  jQuery.bt.options.boxzIndex = 998;
  jQuery.bt.options.wrapperzIndex = 997;
  jQuery.bt.options.postShow = function(){
    $.hideSpinner();
  };

  $('#new_feed_item,#edit_feed_item').submit(function(e){
    $.showSpinner();
  });

  /*
  $('.hub_tabs').tabs({
    cookie: {
      expires: 3 
    },
    beforeLoad: function(event, ui){
      $.showSpinner();
      ui.jqXHR.error(function(jqXHR,textStatus,errorThrown){
        $.showMajorError(jqXHR,textStatus,errorThrown);
      })
    },
    load: function(event, ui) {
        $.checkPlaceholders();
        $.initPerPage();
        $.hideSpinner();
        $.processReturnCookie();
        $('#add_feed_to_hub').ajaxForm({
          dataType: 'html',
          beforeSend: function(){
            $.showSpinner();
            $('.add_feed_container .notices').html('');
          },
          complete: function(){
            $.hideSpinner();
          },
          success: function(html){
            // Update the feed list.
            var current_index = $('.hub_tabs').tabs('option','selected');
            $('.hub_tabs').tabs('load',current_index);
          },
          error: function(jqXHR){
            $('.add_feed_container .notices').append('<div class="error">' + jqXHR.responseText + '</div>');
          }
        });
    }
  });
  */
  
  // bound dynamically b/c the jquery ui tabs() function creates elements
  $('.hub_tabs .ui-tabs-nav').addClass('grid_3');
  $('.hub_tabs .ui-tabs-panel').addClass('grid_13');
  $('.hub_tabs').append('<div class="clear"></div>');

  $.bindHoverRows();

  $('.toggler').bind({
    mouseover: function(){
      $(this).css({cursor: 'pointer', textDecoration: 'underline'})
    },
    mouseout: function(){
      $(this).css({textDecoration: 'none'})
    },
    click: function(e){
      e.preventDefault();
      var targetId = '#' + $(this).attr('id') + '-target';
      if($(targetId).is(':visible')){
        $(targetId).hide('medium');
        $(this).find('.toggler-indicator').attr('class', 'toggler-indicator ui-silk ui-silk-arrow-right inline');
      } else {
        $(this).find('.toggler-indicator').attr('class', 'toggler-indicator ui-silk ui-silk-arrow-down inline');
        $(targetId).show('medium');
        if($(this).hasClass('remove_after_toggling')){
          $(this).remove();
        }
        
      }
    }
  });

  // For tabs that need minimal options.
  $('.tabs').tabs({
    cookie: {
      expires: 3
    },
    beforeLoad: function(){
      $.showSpinner();
    },
    ajaxOptions: {
      dataType: 'html',
      complete: function(){
        $.checkPlaceholders();
        $.initPerPage();
        $.hideSpinner();
      },
      error: function(jqXHR,textStatus,errorThrown){
        $.showMajorError(jqXHR,textStatus,errorThrown);
      }
    }
  });

  // bound dynamically b/c the jquery ui tabs() function creates elements
  $('.tabs .ui-tabs-nav').addClass('grid_3');
  $('.tabs .ui-tabs-panel').addClass('grid_13');
  $('.tabs').append('<div class="clear"></div>');

  $('textarea').not('.noEditor').each(function(){
    $.initEditor(this);
  });

  if($('#logged_in, #bookmarklet-tag-controls-allowed').length > 0){
    $('.add_input_source_control').live({
      click: function(e){
        e.preventDefault();
        var remix_id = $(this).attr('republished_feed_id');
        var dialogNode = $('<div><div class="dialog-error alert alert-danger" style="display:none;"></div><div class="dialog-notice alert alert-info" style="display:none;"></div></div>');
          var prepend = '';
          var message = "<h2>Please enter the tag you'd like to add<h2>";
          $(dialogNode).append(prepend + '<h2>' + message + '</h2><form method="post" action="/input_sources" accept-charset="UTF-8"><input type="hidden" value="' + $('[name=csrf-token]').attr('content') + '" name="authenticity_token"><input type="hidden" name="return_to" value="' + window.location+ '"><input type="text" id="new_tag_for_filter" name="input_source[item_source_attributes][name]" size="40" /><input type="hidden" value="ActsAsTaggableOn::Tag" name="input_source[item_source_attributes][type]" id="input_source_item_source_type"><input type="hidden" value="' + remix_id + '" name="input_source[republished_feed_id]" id="input_source_republished_feed_id"><input type="hidden" value="add" name="input_source[effect]" id="input_source_effect"></form>');        
  $(dialogNode).dialog({
            modal: true,
            width: 600,
            minWidth: 400,
            height: 'auto',
            title: '',
            buttons: {
              Cancel: function(){
                $(dialogNode).dialog('close');
                $(dialogNode).remove();
              },
              Submit: function(){
                $('#new_tag_for_filter').parent('form').submit();
                $(dialogNode).dialog('close');
                $(dialogNode).remove();
              }
            }
          });
          return false;
       }
    });

    $('.add_filter_control').live({
      click: function(e){
        e.preventDefault();
        var tag_id = $(this).attr('data_id');
        var hub_id = $(this).attr('data_hub_id');
        var filter_type = $(this).attr('data_type');
        var filter_href = $(this).attr('href');
        var tagList = '';
        if ($(this).attr('tag_list') != null && $(this).attr('tag_list') != '' ) {
          tagList =  '<div>Tags applied: ' + $(this).attr('tag_list') + '</div>'; 
        }
        if(filter_type == 'ModifyTagFilter' || (filter_type == 'AddTagFilter' && tag_id == undefined) || (filter_type == 'DeleteTagFilter' && tag_id == undefined)){
          var dialogNode = $('<div><div class="dialog-error alert alert-danger" style="display:none;"></div><div class="dialog-notice alert alert-info" style="display:none;"></div></div>');
          var message = '';
          var prepend = '';
          if(filter_type == 'AddTagFilter'){
            message = "<h2>Please enter the tag you'd like to add<h2>";
          } else if (filter_type == 'ModifyTagFilter') {
            if(tag_id == undefined){
              prepend = "<h2>Please enter the tag you want to replace</h2><input type='text' id='modify_tag_for_filter' class='form-control' /><div id='replace_tag_container'></div>";
            }
            message = "<h2>Please enter the replacement tag</h2>";
          } else if (filter_type == 'DeleteTagFilter'){
            message = "<h2>Please enter the tag you'd like to remove</h2>";
          }
          $(dialogNode).append(prepend + '<h2>' + message + '</h2><input type="text" id="new_tag_for_filter" class="form-control" /><div id="new_tag_container"></div>' + tagList);
          $(dialogNode).dialog({
            modal: true,
            width: 600,
            minWidth: 400,
            height: 'auto',
            title: '',
            create: function(){
              $( "#new_tag_for_filter,#modify_tag_for_filter" ).autocomplete({
                source: $.rootPath() + "hubs/" + hub_id + "/tags/autocomplete",
                minLength: 2
              });
            },
            buttons: [
              {
                click: function(){
                  $(dialogNode).dialog('close');
                  $(dialogNode).remove();
                },
                text: 'Cancel',
                class: 'btn btn-primary'
              },
              {
                text: 'Submit',
                click: function(){
                  var replace_tag = undefined;
                  if ($(this).find('#modify_tag_for_filter').length > 0){
                    replace_tag = $(this).find('#modify_tag_for_filter').val();
                  }
                  $.submitTagFilter(filter_href, filter_type, tag_id, $(this).find('#new_tag_for_filter').val(), replace_tag);
                  $(dialogNode).dialog('close');
                  $(dialogNode).remove();
                },
                class: 'btn btn-primary'
              }
            ]
          });
          return false;
        }
        $.submitTagFilter($(this).attr('href'), filter_type, tag_id,'','');
      }
    });
  }

  $('.control').live({
    click: function(e){
      e.preventDefault();
      var url = $(this).attr('href');
      var anchor = $(this).prev().attr('name');
      if (anchor != "" && anchor != null && anchor != undefined) {
        document.cookie = 'return_to=' + anchor;
      } 
      $(this).bt({
        trigger: 'none',
        ajaxPath: url,
        closeWhenOthersOpen: true
      });
      $(this).btOn();
    }
  });

  if($('.ui-widget-content').length > 0){
    $('#hub_search_form,#hub_tag_search_form').live({
      submit: function(e){
        e.preventDefault();
        $(this).ajaxSubmit({
          success: function(html){
            $('#hub_search_form').closest('.ui-widget-content').html(html);
          }
        });
      }
    });
  }

  $.observeDialogShow('.dialog-show');

  $('a.add_item_source_to_custom_republished_feed,a.remove_item_source_from_custom_republished_feed').live({
    click: function(e){
      $('body').data('item_source_id_for_republishing', $(this).attr('data_item_id'));
      $('body').data('item_source_type_for_republishing', $(this).attr('data_item_type'));
      if($(this).hasClass('add_item_source_to_custom_republished_feed')){
        $('body').data('item_effect_for_republishing', 'add');
      } else {
        $('body').data('item_effect_for_republishing', 'remove');
      }
    }
  });

  $('a.choose_republished_feed').live({
    click: function(e){
      e.preventDefault();
      var republished_feed_id = $(this).attr('data_id');
      var item_source_id = $('body').data('item_source_id_for_republishing');
      var item_source_type = $('body').data('item_source_type_for_republishing');
      var item_effect = $('body').data('item_effect_for_republishing');
      var user_id = $('input[name="user_ids[]"]').val();
      var search_query = $('#q').val();
      var hub_id = $('body').data('hub_id');
      var args = { 
        search_string: search_query, 
        hub_id: hub_id,
        input_source: {
          republished_feed_id: republished_feed_id, 
          item_source_type: item_source_type, 
          item_source_id: item_source_id, 
          effect: item_effect,
          created_by_only_id: (typeof user_id === 'undefined' ? false : user_id)
        }
      };

      // TODO - make this emit when it's been added.
      $.ajax({
        cache: false,
        dataType: 'html',
        url: $.rootPath() + 'input_sources',
        type: 'post',
        data: args,
        beforeSend: function(){ 
          $.showSpinner();
          $('.dialog-error,.dialog-notice').html('').hide();
        },
        complete: function(){ $.hideSpinner();},
        success: function(html){
          $('.dialog-notice').show().text(html);
        },
        error: function(jqXHR, textStatus, errorThrown){
          $('.dialog-error').show().html(jqXHR.responseText);
        }
      });
    }
  });
  $.observeListPagination();

});

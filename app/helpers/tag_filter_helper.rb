# frozen_string_literal: true
module TagFilterHelper
  def filter_css_class(filter)
    case filter.class.name
    when 'AddTagFilter'
      'add'
    when 'ModifyTagFilter'
      'modify'
    when 'DeleteTagFilter'
      'delete'
    end
  end

  def filter_description(filter)
    case filter.class.name
    when 'AddTagFilter'
      'Add'
    when 'ModifyTagFilter'
      'Change'
    when 'DeleteTagFilter'
      'Delete'
    end
  end

  def self.split_tags(tags, hub)
    all_tags = []
    whitespace_tags = []
    delimiters = hub.tags_delimiter_with_default

    # split by whitespace first
    whitespace_tags = tags.gsub(/\s+/m, ' ').gsub(/^\s+|\s+$/m, '').split(' ')

    # then split by the delimiter
    all_tags << whitespace_tags.map do |tag|
      delimiters.map do |delimiter|
        tag.split(delimiter).map do|str| 
          str.delete(hub.tags_delimiter.join)
        end
      end
    end

    all_tags.flatten.uniq
  end
end

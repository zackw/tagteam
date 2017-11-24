namespace :tagteam do
  desc 'Convert String Delimiter to Array'
  task tags_delimiter: :environment do
    Hub.all.each do |hub|
      if hub.tags_delimiter.present?
        hub.tags_delimiter = [hub.tags_delimiter]
        hub.save
      end
    end
  end
end
class AddHubSettingBookmarkletEmptyDescriptionReminder < ActiveRecord::Migration[5.0]
  def up
    add_column :hubs, :bookmarklet_empty_description_reminder, :string
  end

  def down
    remove_column :hubs, :bookmarklet_empty_description_reminder
  end
end

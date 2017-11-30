# frozen_string_literal: true

module Messages
  # method to create/validate the messages
  class Create < ActiveInteraction::Base
    object :hub
    string :subject
    string :body

    validates :subject, :body, presence: true

    def execute
      MessagesMailer.message(hub, subject, body).deliver_later
    end
  end
end

# frozen_string_literal: true

# mailer to send messages to hub members
class MessagesMailer < ActionMailer::Base
  default from: Tagteam::Application.config.default_sender

  def message(hub, _subject, body)
    @body = body
    mail(to: hub.users_with_roles.map(&:email),
         subject: _subject,
         body: @body)
  end
end

# frozen_string_literal: true

# Hub owner can send message to any hub member
class MessagesController < ApplicationController
  before_action :find_hub

  def new
    render layout: request.xhr? ? false : 'tabs'
  end

  def create
    message = Messages::Create.run(hub: @hub, subject: params[:message][:subject], body: params[:message][:body])
    if message.valid?
      flash[:notice] = 'Your message has sent sucessfully'
    else
      flash[:error] = 'Something went wrong, try again.'
    end

    redirect_to new_hub_message_path
  end

  private

  def find_hub
    @hub = Hub.find(params[:hub_id])
    authorize @hub
  end
end

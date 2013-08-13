require 'pubnub'
require "securerandom"

class CanvasController < ApplicationController

	protect_from_forgery :except => :save_points
	protect_from_forgery :except => :get_points 
  layout false

  def touch
  end

  def touch_student

  end

  def save_points
  	init_vars

  	@pts = params[:points]
  	uqid = SecureRandom.hex(20) 

  	pt = Point.new();
  	pt.content = @pts
  	pt.uqid = uqid
  	pt.save()

  	@message = "{'points_uqid' : '" + uqid + "'}"
  	@message = { points_uqid: uqid }.to_json

    @pubnub.publish(:channel => @channel, :message => @message, :callback => method(:set_output))
    render :text => @message

  end

  def get_points
  	uqid = params[:uqid]
  	pts = Point.where("uqid = ?", params[:uqid])
  	if (pts.size == 0)
  		render :json => pts
  	else
  		pt = pts[0]
  		render :json =>JSON.parse(pt.content)
  	end
  end


  def clear_points
  	init_vars

  	@message = { cleared: true }.to_json

    @pubnub.publish(:channel => @channel, :message => @message, :callback => method(:set_output))
    render :text => @message
  end

  def pubnub
  end


  def draw
  end

  def init_vars
    @channel = 'classid_whiteboard'
    
    # Init Pubnub Object
    @pubnub = Pubnub.new(:subscribe_key => 'sub-c-5639cc4c-fe7e-11e2-b670-02ee2ddab7fe', :publish_key => 'pub-c-bcd6e4ac-9571-4a94-a256-00ed90f32521')
  end

  def set_output(out)
  	@out = out; 
  end
end

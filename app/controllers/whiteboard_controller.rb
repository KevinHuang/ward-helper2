class WhiteboardController < ApplicationController
	
	layout false

  protect_from_forgery :except => :save
  #protect_from_forgery :except => :get_points 

  def new
  end

  def list
  	
  end

  def replay
  	
  end

  def save
    #init_vars

    pts = params[:points]
    uqid = params[:uqid]
    diag_name = params[:name]

    if (uqid.nil?)
      uqid = SecureRandom.hex(20) 

      pt = Point.new();
      pt.content = @pts
      pt.uqid = uqid
      pt.save()



    end
    
    @message = "{'points_uqid' : '" + uqid + "'}"
    @message = { points_uqid: uqid }.to_json

    @pubnub.publish(:channel => @channel, :message => @message, :callback => method(:set_output))
    render :text => @message
  end

end

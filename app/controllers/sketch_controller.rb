class SketchController < ApplicationController
	layout false

  protect_from_forgery :except => :save

  def list
    @skets = Sketch.select("name, uqid").order('id DESC').limit(10);
    #render :text => @skets.size.to_s
  end

  def new
    
  end

  def show
    @sket_uqid = params[:uqid]
    #render :text=>@sket_uqid

    if (! @sket_uqid.nil?) 
      skts = Sketch.where("uqid = ?", @sket_uqid)

      if (skts.size == 0)
        @sket = nil
      else
        @sket = skts[0]
        @content= @sket.content
        #ActiveRecord::Base.include_root_in_json = false
        #@sket = @sket.to_json()
      end
    end
  end

  def save
  	data = params[:data]
    uqid = params[:uqid]
    diag_name = params[:name]

    if (uqid.nil?)

      uqid = SecureRandom.hex(20) 

      sket = Sketch.new();
      sket.name = diag_name 
      sket.content = JSON.parse(data) if (!data.nil?)
      sket.uqid = uqid
      sket.save()
      #render :text=> "hello!"
    else
      skts = Sketch.where("uqid = ?", uqid)
      if (skts.size == 0)
        @sket = nil
      else
        @sket = skts[0]
        @sket.content =  JSON.parse(data) if (!data.nil?)
        #@sket.name = diag_name;
        @sket.save()
      end
    end
    
    @message = "{'points_uqid' : '" + uqid + "'}"
    @message = { sketch_uqid: uqid }.to_json

    #@pubnub.publish(:channel => @channel, :message => @message, :callback => method(:set_output))
    render :text => @message
  end
end

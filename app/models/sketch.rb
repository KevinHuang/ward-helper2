class Sketch < ActiveRecord::Base
	serialize :content, JSON
end

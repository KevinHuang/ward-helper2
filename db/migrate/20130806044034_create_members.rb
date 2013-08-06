class CreateMembers < ActiveRecord::Migration
  def change
    create_table :members do |t|
    	t.string :userid
    	t.string :name
    	t.string :gender
    end
  end
end

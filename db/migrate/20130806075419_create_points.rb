class CreatePoints < ActiveRecord::Migration
  def change
    create_table :points do |t|
      t.string :content
      t.string :uqid

      t.timestamps
    end
  end
end

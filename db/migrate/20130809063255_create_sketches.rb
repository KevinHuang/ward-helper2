class CreateSketches < ActiveRecord::Migration
  def change
    create_table :sketches do |t|
      t.string :name
      t.text :content
      t.text :uqid
      t.string :userid

      t.timestamps
    end
  end
end

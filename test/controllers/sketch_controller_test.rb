require 'test_helper'

class SketchControllerTest < ActionController::TestCase
  test "should get list" do
    get :list
    assert_response :success
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should get save" do
    get :save
    assert_response :success
  end

end

require 'test_helper'

class WhiteboardControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
  end

  test "should get list" do
    get :list
    assert_response :success
  end

  test "should get replay" do
    get :replay
    assert_response :success
  end

end

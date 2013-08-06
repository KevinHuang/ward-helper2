require 'test_helper'

class CanvasControllerTest < ActionController::TestCase
  test "should get touch" do
    get :touch
    assert_response :success
  end

  test "should get draw" do
    get :draw
    assert_response :success
  end

end

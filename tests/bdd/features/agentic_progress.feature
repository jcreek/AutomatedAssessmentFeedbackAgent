Feature: AI agentic feedback process

  As a user
  I want to see the steps the AI agent takes to assess my submission
  So that I understand how feedback is generated

  Scenario: View agentic progress during assessment
    Given I have submitted an assignment for assessment
    When the AI agent is processing my submission
    Then I should see a progress indicator with tool steps such as:
      | Step Description                        |
      | Assessing the submission against rubric |
      | Analyzing essay structure and argument  |
      | Generating personalized feedback        |
      | Creating self-reflection questions      |
      | Checking spelling and grammar           |
    And each step should show an icon and status

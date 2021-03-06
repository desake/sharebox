##
# the satisfaction model

class Satisfaction < ApplicationRecord

  # february 2019
  # to be able to operate in weak logic on the table satisfactions
  # the following 2 lines are commented....
  #belongs_to :folder
  #validates :folder_id, presence: true
  belongs_to :user

  belongs_to :poll 

  validates :poll_id, presence: true
  
  ##
  # return the meta table for the satisfaction feedback
  def calc_meta(folder=nil,client=nil)
    unless folder
      folder=Folder.find_by_id(self.folder_id)
    end
    unless folder.case_number == ""
      title="#{folder.name} (#{folder.case_number})"
    else
      title=folder.name
    end
    owner=User.find_by_id(folder.user_id)
    unless client
      client=User.find_by_id(self.user_id)
    end
    result=[]
    result.push(title)
    result.push(" - #{Validations.client_pattern}: ")
    result.push(client.email)
    result.push(" - #{Validations.project_manager_pattern}: ")
    result.push(owner.email)
    result
  end
  
  ##
  # meta translation
  def get_meta_i18n
    self.case_number[Validations.client_pattern] = I18n.t("sb.client")
    self.case_number[Validations.project_manager_pattern] = I18n.t("sb.project_manager")
    self.case_number
  end
  
end

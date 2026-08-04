def request_approval():
    approval = input ( "Approve remediation? (yes/No)" )

    return approval.lower() == "yes"
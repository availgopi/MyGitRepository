def analyze_log(state):

    log = state["log"]

    analysis = f"""

    Log Analysis:

    Detected issue from log:

    {log}

    Severity:
    High

    Category:
    Application Failure
    """

    state["log_analysis"] = analysis
    return state



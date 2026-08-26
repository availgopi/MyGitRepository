from pathlib import Path


ACTION_SCRIPTS = {
    "Restart Payment API Service": "restart_payment_api.ps1",
    "Increase SQL Connection Pool": "increase_sql_connection_pool.ps1",
}


def execute_script(script_path: Path, action_name: str):
    """
    Production-safe remediation simulation.

    The current AIOps demo simulates remediation actions instead of
    executing OS-specific PowerShell commands.
    """

    if not script_path.exists():
        return f"Simulation completed: {action_name}"

    return f"Executed: {action_name}"


def execute_action(incident):

    execution_log = []

    project_root = Path(__file__).resolve().parents[2]
    scripts_folder = project_root / "scripts"

    for action in incident.recommended_actions:

        script_name = ACTION_SCRIPTS.get(action)

        if script_name:

            script_path = scripts_folder / script_name

            execution_log.append(
                execute_script(script_path, action)
            )

        else:

            execution_log.append(
                f"No automation registered for: {action}"
            )

    incident.execution_result = "\n".join(execution_log)

    return incident
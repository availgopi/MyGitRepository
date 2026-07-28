import subprocess
from pathlib import Path


ACTION_SCRIPTS = {
    "Restart Payment API Service": "restart_payment_api.ps1",
    "Increase SQL Connection Pool": "increase_sql_connection_pool.ps1",
}


def execute_script(script_path: Path):

    result = subprocess.run(
        [
            "powershell",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(script_path)
        ],
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        return result.stdout

    return result.stderr


def execute_action(incident):

    execution_log = []

    project_root = Path(__file__).resolve().parents[2]

    scripts_folder = project_root / "scripts"

    for action in incident.recommended_actions:

        script_name = ACTION_SCRIPTS.get(action)

        if script_name:

            script_path = scripts_folder / script_name

            execution_log.append(
                execute_script(script_path)
            )

        else:

            execution_log.append(
                f"No automation registered for: {action}"
            )

    incident.execution_result = "\n\n".join(execution_log)

    return incident
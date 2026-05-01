from flask import Flask, render_template, send_from_directory, jsonify, request
import os
import pattern
import graph
import detection
import csv

app = Flask(__name__, static_folder='Static', template_folder='Templates')

# Auto-run detection and pattern analysis if missing
# @app.route('/run_detection')
# def run_detection():
#     detection.run_detection('images', 'output')
#     pattern.analyze_traffic_from_folder('output', 3, 'traffic_report.csv', 'traffic_flow_graph.png')
#     return jsonify({"status": "done"})
@app.route('/run_detection')
def run_detection():
    return jsonify({
        "status": "disabled on cloud",
        "message": "Run detection locally due to compute limits"
    })
# Serve the dashboard
@app.route('/')
def index():
    return render_template('index.html')

# Serve static files (JS, CSS)
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

# API: Total vehicles (from traffic_report.csv)
@app.route('/total_vehicles')
def total_vehicles():
    total = 0
    try:
        with open('traffic_report.csv', 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    total += int(row['Vehicle_Count'])
                except Exception:
                    continue
    except Exception:
        pass
    return jsonify({'total': total})

# API: Vehicle data per frame (for chart)
@app.route('/vehicle_data')
def vehicle_data():
    data = []
    csv_path = os.path.join('output', 'vehicle_counts.csv')
    try:
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append({'frame': row['frame'], 'count': int(row['count'])})
    except Exception:
        pass
    return jsonify(data)

# API: Analyze traffic pattern (calls pattern.py)
@app.route('/analyze_pattern', methods=['POST'])
def analyze_pattern():
    folder = request.json.get('folder', 'output')
    lane_count = int(request.json.get('lane_count', 3))
    report_csv = 'traffic_report.csv'
    graph_png = 'traffic_flow_graph.png'
    report_data = pattern.analyze_traffic_from_folder(folder, lane_count, report_csv, graph_png)
    return jsonify({'status': 'ok', 'report_csv': report_csv, 'graph_png': graph_png, 'count': len(report_data)})

# API: Generate density vs green graph (calls graph.py)
@app.route('/generate_graph', methods=['POST'])
def generate_graph():
    csv_path = request.json.get('csv', 'traffic_report.csv')
    output_png = request.json.get('output', 'density_vs_green_time.png')
    success = graph.generate_density_vs_green_graph(csv_path, output_png)
    return jsonify({'status': 'ok' if success else 'fail', 'output_png': output_png})

# API: Density data per image (for chart)
@app.route('/density_data')
def density_data():
    data = []
    try:
        with open('traffic_report.csv', 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Convert scientific notation to percentage for better readability
                    density_value = float(row['Density']) * 1000000  # Convert to percentage
                    data.append({'image': row['Image'], 'density': round(density_value, 2)})
                except Exception:
                    continue
    except Exception:
        pass
    return jsonify(data)

# API: Traffic density summary for dashboard cards
@app.route('/traffic_density_summary')
def traffic_density_summary():
    try:
        with open('traffic_report.csv', 'r') as f:
            reader = csv.DictReader(f)
            densities = []
            for row in reader:
                try:
                    density_value = float(row['Density']) * 1000000  # Convert to percentage
                    densities.append(density_value)
                except Exception:
                    continue
            
            if densities:
                avg_density = sum(densities) / len(densities)
                max_density = max(densities)
                current_density = densities[-1] if densities else 0
                
                return jsonify({
                    'current': round(current_density, 2),
                    'average': round(avg_density, 2),
                    'max': round(max_density, 2)
                })
    except Exception:
        pass
    return jsonify({'current': 0, 'average': 0, 'max': 0})

# API: Traffic pattern data per image (for chart)
@app.route('/traffic_pattern_data')
def traffic_pattern_data():
    data = []
    try:
        with open('traffic_report.csv', 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Extract traffic level from pattern (Low/Medium/High)
                    pattern = row['Traffic_Pattern']
                    if 'Low' in pattern:
                        level = 1
                    elif 'Medium' in pattern:
                        level = 2
                    elif 'High' in pattern:
                        level = 3
                    else:
                        level = 1
                    
                    data.append({'image': row['Image'], 'level': level, 'pattern': pattern})
                except Exception:
                    continue
    except Exception:
        pass
    return jsonify(data)

# API: Get current green time signal and traffic status
@app.route('/green_time_signal')
def green_time_signal():
    try:
        with open('traffic_report.csv', 'r') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            if rows:
                latest_row = rows[-1]  # Get the most recent data
                return jsonify({
                    'traffic_pattern': latest_row['Traffic_Pattern'],
                    'light_instruction': latest_row['Light_Instruction'],
                    'vehicle_count': int(latest_row['Vehicle_Count']),
                    'density': float(latest_row['Density']) * 1000000,  # Convert to percentage
                    'timestamp': latest_row['Image']
                })
    except Exception as e:
        print(f"Error reading traffic report: {e}")
    return jsonify({
        'traffic_pattern': 'No Data',
        'light_instruction': 'No Data',
        'vehicle_count': 0,
        'density': 0,
        'timestamp': 'No Data'
    })

# API: Get average speed data
@app.route('/average_speed')
def average_speed():
    try:
        with open('traffic_report.csv', 'r') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            if rows:
                # Calculate average speed based on traffic density
                # Higher density = lower average speed
                total_speed = 0
                count = 0
                for row in rows:
                    density = float(row['Density']) * 1000000
                    # Simulate speed based on density (inverse relationship)
                    if density > 0.5:  # High density
                        speed = 20  # 20 km/h
                    elif density > 0.2:  # Medium density
                        speed = 40  # 40 km/h
                    else:  # Low density
                        speed = 60  # 60 km/h
                    total_speed += speed
                    count += 1
                
                avg_speed = total_speed / count if count > 0 else 0
                latest_density = float(rows[-1]['Density']) * 1000000
                
                # Current speed based on latest density
                if latest_density > 0.5:
                    current_speed = 20
                elif latest_density > 0.2:
                    current_speed = 40
                else:
                    current_speed = 60
                
                return jsonify({
                    'average_speed': round(avg_speed, 1),
                    'current_speed': current_speed,
                    'speed_unit': 'km/h'
                })
    except Exception as e:
        print(f"Error calculating average speed: {e}")
    return jsonify({
        'average_speed': 0,
        'current_speed': 0,
        'speed_unit': 'km/h'
    })

# Serve generated images (traffic_flow_graph.png, density_vs_green_time.png, etc.)
@app.route('/output/<path:filename>')
def output_files(filename):
    return send_from_directory('output', filename)

# Main entry point
if __name__ == '__main__':
    app.run(debug=True)

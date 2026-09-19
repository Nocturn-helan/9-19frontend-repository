const state = { data: null };
let barChart = null;
let lineChart = null;
let pieChart = null;

const loadData = async () => {
  $('#status').text('加载中...').show();
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    if (data.series.length === 0) {
      $('#status').text('暂无数据').show();
      return;
    }
    state.data = data;
    $('#sub-title').text(data.title + ' · 数据来源：实践调查问卷');
    $('#status').hide();
    renderCards(data);
    renderBarChart(data);
    renderLineChart(data);
    renderPieChart(data);
  } catch (error) {
    $('#status').text('加载失败：' + error.message).show();
  }
};

const renderCards = (data) => {
  const months = data.months;
  data.series.forEach(s => {
    const total = s.counts.reduce((sum, n) => sum + n, 0);
    $('#cards').append(`
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${s.category}</h3>
            <p class="card-text fs-4">${total}</p>
            <p class="card-text small text-muted">共${months.length}个月累计使用量</p>
          </div>
        </div>
      </div>
    `);
  });
};
const renderBarChart = (data) => {
  if (barChart === null) {
    barChart = echarts.init(document.querySelector('#bar-chart'));
  }
  barChart.setOption({
    title: { text: '各月自习室使用量', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    xAxis: { data: data.months },
    yAxis: { name: '人' },
    series: data.series.map(s => ({
      name: s.category,
      type: 'bar',
      data: s.counts
    }))
  });
};
const renderLineChart = (data) => {
  if (lineChart !== null) {
    lineChart.destroy();               // 防重复初始化
  }
  const ctx = document.querySelector('#line-chart');
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.months,
      datasets: data.series.map(s => ({
        label: s.category,
        data: s.counts,
        borderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: '自习室日使用量变化趋势（单位：人）' }
      }
    }
  });
};
const renderPieChart = (data) => {
  if (pieChart === null) {
    pieChart = echarts.init(document.querySelector('#pie-chart'));
  }
  
  // 计算所有月份的总和，用于画饼图
  const pieData = data.series.map(s => {
    const total = s.counts.reduce((sum, n) => sum + n, 0);
    return { name: s.category, value: total };
  });

  pieChart.setOption({
    title: { text: '各类自习室使用量占比', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b}: {c} 人 ({d}%)' }, // 鼠标悬浮显示数量与百分比
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: '60%',          // 饼图大小
        center: ['50%', '50%'], // 居中显示
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  });
};
window.addEventListener('resize', () => {
  if (barChart) barChart.resize();
  if (pieChart) pieChart.resize();
  // Chart.js响应式默认自动处理，无需手动
});
loadData();
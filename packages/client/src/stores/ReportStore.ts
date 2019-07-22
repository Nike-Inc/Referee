import { observable, action, computed } from 'mobx';
import {
  CanaryAnalysisResult,
  CanaryClassifierThresholdsConfig,
  CanaryExecutionRequest,
  CanaryExecutionStatusResponse,
  CanaryJudgeGroupScore,
  CanaryResult,
  MetricSetPair
} from '../domain/Kayenta';
import { ofNullable } from '../util/OptionalUtils';

enum classifications {
  FAIL = 'Fail',
  NODATA = 'Nodata',
  PASS = 'Pass'
}

export default class ReportStore {
  @observable
  application: string = '';

  @observable
  result: CanaryResult = {};

  @observable
  thresholds: CanaryClassifierThresholdsConfig | undefined;

  @observable
  canaryAnalysisResultByIdMap: KvMap<CanaryAnalysisResult> = {};

  @observable
  metricSetPairListId: string = '';

  @observable
  metricSetPairList: MetricSetPair[] = [];

  @observable
  canaryExecutionStatusResponse: CanaryExecutionStatusResponse | undefined;

  @action.bound
  updateFromCanaryResponse(canaryExecutionStatusResponse: CanaryExecutionStatusResponse) {
    this.canaryExecutionStatusResponse = canaryExecutionStatusResponse;
    this.application = ofNullable(canaryExecutionStatusResponse.application).orElse('ad-hoc');
    this.result = canaryExecutionStatusResponse.result as CanaryResult;
    this.thresholds = (canaryExecutionStatusResponse.canaryExecutionRequest as CanaryExecutionRequest).thresholds;
    this.metricSetPairListId = canaryExecutionStatusResponse.metricSetPairListId as string;

    const judgeResult = ofNullable(this.result.judgeResult).orElseThrow(
      () => new Error('Expected there to be judgement results on the Canary Result object')
    );

    judgeResult.results.forEach((canaryAnalysisResult: CanaryAnalysisResult) => {
      this.canaryAnalysisResultByIdMap[canaryAnalysisResult.id] = canaryAnalysisResult;
    });
  }

  @computed
  get idListByMetricGroupNameMap(): KvMap<string[]> {
    const idListByMetricGroupNameMap: KvMap<string[]> = {};

    this.result.judgeResult!.results.forEach(canaryAnalysisResult => {
      canaryAnalysisResult.groups.forEach(group => {
        if (idListByMetricGroupNameMap[group]) {
          idListByMetricGroupNameMap[group].push(canaryAnalysisResult.id);
        } else {
          idListByMetricGroupNameMap[group] = [canaryAnalysisResult.id];
        }
      });
    });

    return idListByMetricGroupNameMap;
  }

  @computed
  get groupScoreByMetricGroupNameMap(): KvMap<CanaryJudgeGroupScore> {
    const groupScoreByMetricGroupNameMap: KvMap<CanaryJudgeGroupScore> = {};
    this.result.judgeResult!.groupScores.forEach(
      groupScore => (groupScoreByMetricGroupNameMap[groupScore.name] = groupScore)
    );

    return groupScoreByMetricGroupNameMap;
  }

  @computed
  get metricSetPairsByIdMap(): KvMap<MetricSetPair> {
    const metricSetPairsByIdMap: KvMap<MetricSetPair> = {};
    this.metricSetPairList.forEach(metricSetPair => {
      metricSetPairsByIdMap[metricSetPair.id] = metricSetPair;
    });

    return metricSetPairsByIdMap;
  }

  @computed
  get classificationCountMap(): Map<string, number> {
    const classificationCountMap = new Map();
    classificationCountMap.set(classifications.FAIL, 0);
    classificationCountMap.set(classifications.NODATA, 0);
    classificationCountMap.set(classifications.PASS, 0);

    Object.entries(this.canaryAnalysisResultByIdMap).map(id => {
      let current = classificationCountMap.get(id[1].classification);
      current++;
      classificationCountMap.set(id[1].classification, current);
    });

    return classificationCountMap;
  }

  @action.bound
  setMetricSetPairList(metricSetPairList: MetricSetPair[]) {
    this.metricSetPairList = metricSetPairList;
  }
}

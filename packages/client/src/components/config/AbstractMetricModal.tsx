import * as React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import CreatableSelect from 'react-select/lib/Creatable';
import TitledSection from '../../layout/titledSection';
import { CanaryMetricConfig, CanaryMetricSetQueryConfig } from '../../domain/Kayenta';
import './AbstractMetricModal.scss';
import { FormGroup } from '../../layout/FormGroup';
import { InlineTextGroup } from '../../layout/InlineTextGroup';
import { boundMethod } from 'autobind-decorator';
import { ValidationResultsWrapper } from '../../domain/Referee';

const initialState = {
  errors: {},
  touched: {
    groups: false,
    name: false,
    direction: false,
    criticality: false,
    nanStrategy: false,
    scopeName: false,
    metricName: false,
    aggregationMethod: false,
    dimensions: false
  },
  isValid: true,
  existingMetric: undefined
};

const initialMetricState = {
  name: '',
  groups: [],
  analysisConfigurations: {
    canary: {
      direction: 'either',
      nanStrategy: 'remove'
    }
  },
  scopeName: 'default'
};

export interface MetricModalProps {
  type: string;
  existingMetric?: CanaryMetricConfig;
  groups: string[];
  cancel: () => void;
  submit: (metric: CanaryMetricConfig, existingMetric: CanaryMetricConfig | undefined) => void;
}

export interface MetricModalState<T extends CanaryMetricSetQueryConfig> {
  errors: KvMap<string>;
  touched: KvMap<boolean>;
  existingMetric?: CanaryMetricConfig<T>;
  isValid: boolean;
  metric: CanaryMetricConfig<T>;
}

export abstract class AbstractMetricModal<T extends CanaryMetricSetQueryConfig> extends React.Component<
  MetricModalProps,
  MetricModalState<T>
> {
  public constructor(props: MetricModalProps) {
    super(props);

    if (props.existingMetric) {
      const validationErrors = this.validateCanaryMetricConfig(props.existingMetric, props.type);
      this.state = Object.assign({}, this.getInitialState(), {
        existingMetric: props.existingMetric,
        metric: props.existingMetric,
        isValid: validationErrors.isValid,
        errors: validationErrors.errors,
        touched: {
          groups: true,
          name: true,
          direction: true,
          criticality: true,
          nanStrategy: true,
          scopeName: true,
          metricName: true,
          aggregationMethod: true,
          dimensions: true
        }
      });
    } else {
      this.state = this.getInitialState();
    }
  }

  abstract validateCanaryMetricConfig(existingMetric: CanaryMetricConfig, type: string): ValidationResultsWrapper;

  private getInitialState(): MetricModalState<T> {
    return Object.assign({}, initialState, {
      metric: Object.assign({}, initialMetricState, { query: this.getQueryInitialState() })
    });
  }

  private handleMetricNameChange(value: string): void {
    this.setState(
      {
        metric: Object.assign({}, this.state.metric, {
          name: value
        })
      },
      this.validate
    );
  }

  private handleFailOnChange(option: string): void {
    this.setState(
      {
        metric: Object.assign({}, this.state.metric, {
          analysisConfigurations: Object.assign({}, this.state.metric.analysisConfigurations, {
            canary: Object.assign({}, this.state.metric.analysisConfigurations.canary, {
              direction: option
            })
          })
        })
      },
      this.validate
    );
  }

  private handleNanStrategyChange(option: string): void {
    const canaryAnalysisConfigurationCopy = Object.assign({}, this.state.metric.analysisConfigurations.canary);

    if (option === 'default') {
      delete canaryAnalysisConfigurationCopy['nanStrategy'];
    } else {
      canaryAnalysisConfigurationCopy.nanStrategy = option;
    }

    this.setState(
      {
        metric: Object.assign({}, this.state.metric, {
          analysisConfigurations: Object.assign({}, this.state.metric.analysisConfigurations, {
            canary: canaryAnalysisConfigurationCopy
          })
        })
      },
      this.validate
    );
  }

  private getNanStrategy(): string {
    const strategy = this.state.metric.analysisConfigurations.canary.nanStrategy;
    return strategy ? strategy : 'default';
  }

  private handleGroupSelect(value: any): void {
    this.setState(
      {
        metric: Object.assign({}, this.state.metric, {
          groups: value.map((group: { value: string }) => group.value)
        })
      },
      this.validate
    );
  }

  private handleScopeNameChange(value: string): void {
    this.setState(
      {
        metric: Object.assign({}, this.state.metric, {
          scopeName: value
        })
      },
      this.validate
    );
  }

  private handleCriticalityChange(criticality: string): void {
    const canaryAnalysisConfigurationCopy = Object.assign({}, this.state.metric.analysisConfigurations.canary);

    if (criticality === 'critical') {
      delete canaryAnalysisConfigurationCopy['mustHaveData'];
      canaryAnalysisConfigurationCopy['critical'] = true;
    }

    if (criticality === 'mustHaveData') {
      delete canaryAnalysisConfigurationCopy['critical'];
      canaryAnalysisConfigurationCopy['mustHaveData'] = true;
    }

    if (criticality === 'normal') {
      delete canaryAnalysisConfigurationCopy['critical'];
      delete canaryAnalysisConfigurationCopy['mustHaveData'];
    }

    this.setState(
      {
        metric: Object.assign({}, this.state.metric, {
          analysisConfigurations: Object.assign({}, this.state.metric.analysisConfigurations, {
            canary: canaryAnalysisConfigurationCopy
          })
        })
      },
      this.validate
    );
  }

  private getCriticalityFromState(): string {
    if (this.state.metric.analysisConfigurations.canary.critical === true) {
      return 'critical';
    }

    if (this.state.metric.analysisConfigurations.canary.mustHaveData === true) {
      return 'mustHaveData';
    }

    return 'normal';
  }

  @boundMethod
  protected updateQueryObject(key: string, value: any) {
    this.setState(
      {
        metric: Object.assign({}, this.state.metric, {
          query: Object.assign({}, this.state.metric.query, {
            [key]: value
          })
        })
      },
      this.validate
    );
  }

  protected touch(id: string): void {
    const touched: KvMap<boolean> = {};
    touched[id] = true;
    this.setState({
      touched: Object.assign({}, this.state.touched, touched)
    });
    this.validate();
  }

  protected validate(): void {
    this.setState(this.validateCanaryMetricConfig(this.state.metric, this.props.type));
  }

  abstract getQueryInitialState(): T;

  abstract getMetricSourceSpecificJsx(): JSX.Element;

  render(): React.ReactNode {
    return (
      <div className="configure-metric-modal">
        <Modal size="lg" centered={false} show={true} id="configure-metric-modal" onHide={() => {}}>
          <Modal.Body>
            <TitledSection title="Configure Metric">
              <Form>
                <FormGroup
                  id="groups"
                  label="Groups"
                  touched={this.state.touched.groups}
                  error={this.state.errors.groups}
                >
                  <CreatableSelect
                    formatCreateLabel={() => {
                      return 'Create new group';
                    }}
                    onBlur={() => {
                      this.touch('groups');
                    }}
                    placeholder="Select an existing group or type to create a new group"
                    noOptionsMessage={() => 'No existing groups, start typing to create a new group'}
                    isMulti={true}
                    value={this.state.metric.groups.map(g => ({ value: g, label: g }))}
                    onChange={v => {
                      this.handleGroupSelect(v);
                    }}
                    options={this.props.groups.filter(group => group !== 'all').map(g => ({ value: g, label: g }))}
                  />
                </FormGroup>
                <InlineTextGroup
                  onBlur={() => {
                    this.touch('name');
                  }}
                  touched={this.state.touched.name}
                  error={this.state.errors.name}
                  id="name"
                  label="Name"
                  placeHolderText="Human readable string to describe the metric for the results"
                  value={this.state.metric.name}
                  onChange={e => {
                    this.handleMetricNameChange(e.target.value);
                  }}
                />
                <FormGroup
                  id="fail-on"
                  label="Fail On"
                  touched={this.state.touched.direction}
                  error={this.state.errors['analysisConfigurations.canary.direction']}
                >
                  <Form.Check
                    onChange={() => {
                      this.handleFailOnChange('increase');
                    }}
                    checked={this.state.metric.analysisConfigurations.canary.direction === 'increase'}
                    inline={true}
                    label="Increase"
                    type="radio"
                    id="fail-on-increase"
                  />

                  <Form.Check
                    onChange={() => {
                      this.handleFailOnChange('decrease');
                    }}
                    checked={this.state.metric.analysisConfigurations.canary.direction === 'decrease'}
                    inline={true}
                    label="Decrease"
                    type="radio"
                    id="fail-on-decrease"
                  />

                  <Form.Check
                    onChange={() => {
                      this.handleFailOnChange('either');
                    }}
                    checked={this.state.metric.analysisConfigurations.canary.direction === 'either'}
                    inline={true}
                    label="Either"
                    type="radio"
                    id="fail-on-either"
                  />

                  <Form.Text className="text-muted">
                    Which direction of statistical change triggers the metric to fail. Use Increase for things like
                    error counts, memory usage, etc, where a decrease is not a failure. Use Decrease for things like
                    success counts, etc, where a larger number is not a failure. Use Either when any type of change from
                    the baseline is a failure.
                  </Form.Text>
                </FormGroup>

                <FormGroup
                  id="criticality"
                  label="Criticality"
                  touched={this.state.touched.criticality}
                  error={this.state.errors['criticality']}
                >
                  <Form.Check
                    onChange={() => {
                      this.handleCriticalityChange('normal');
                    }}
                    checked={this.getCriticalityFromState() === 'normal'}
                    inline={false}
                    label="Normal"
                    type="radio"
                    id="criticality"
                  />
                  <Form.Text className="text-muted">
                    Use to remove the metric from the metric group if it has no data so it will not be used for group
                    score calculation.
                  </Form.Text>

                  <Form.Check
                    onChange={() => {
                      this.handleCriticalityChange('critical');
                    }}
                    checked={this.getCriticalityFromState() === 'critical'}
                    inline={false}
                    label="Critical / Must Have Data"
                    type="radio"
                    id="criticality"
                  />
                  <Form.Text className="text-muted">
                    Use to fail the entire canary if this metric fails or has no data (recommended for important metrics
                    that signal service outages or severe problems).
                  </Form.Text>

                  <Form.Check
                    onChange={() => {
                      this.handleCriticalityChange('mustHaveData');
                    }}
                    checked={this.getCriticalityFromState() === 'mustHaveData'}
                    inline={false}
                    label="Must Have Data"
                    type="radio"
                    id="criticality"
                  />
                  <Form.Text className="text-muted">Use to fail a metric if data is missing.</Form.Text>
                </FormGroup>

                <FormGroup
                  id="nan-strategy"
                  label="NaN Strategy"
                  touched={this.state.touched.nanStrategy}
                  error={this.state.errors['analysisConfigurations.canary.nanStrategy']}
                >
                  <Form.Check
                    onChange={() => {
                      this.handleNanStrategyChange('replace');
                    }}
                    checked={this.getNanStrategy() === 'replace'}
                    inline={true}
                    label="Replace with zero"
                    type="radio"
                    id="nan-strategy-replace"
                  />

                  <Form.Check
                    onChange={() => {
                      this.handleNanStrategyChange('remove');
                    }}
                    checked={['remove', 'default'].includes(this.getNanStrategy())}
                    inline={true}
                    label="Remove"
                    type="radio"
                    id="nan-strategy-remove"
                  />

                  <Form.Text className="text-muted">
                    How to handle NaN values which can occur if the metric does not return data for a particular time
                    interval. NaN Strategy must be Remove for Criticality options to work as expected.
                  </Form.Text>
                </FormGroup>

                <InlineTextGroup
                  onBlur={() => {
                    this.touch('scopeName');
                  }}
                  touched={this.state.touched.scopeName}
                  error={this.state.errors.scopeName}
                  id="scope-name"
                  label="Scope Name"
                  value={this.state.metric.scopeName}
                  onChange={e => this.handleScopeNameChange(e.target.value)}
                  disabled={false}
                  subText="default is the only accepted value here."
                />

                {/* Inject the metric source specific JSX here */}
                {this.getMetricSourceSpecificJsx()}
              </Form>
            </TitledSection>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() => {
                this.props.cancel();
              }}
              size="sm"
              variant="outline-warning"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const valErrors = this.validateCanaryMetricConfig(this.state.metric, this.props.type);
                if (!valErrors.isValid) {
                  this.setState(valErrors);
                  this.setState({
                    touched: {
                      groups: true,
                      name: true,
                      direction: true,
                      criticality: true,
                      nanStrategy: true,
                      scopeName: true,
                      metricName: true,
                      aggregationMethod: true,
                      dimensions: true
                    }
                  });
                  return;
                }
                this.props.submit(this.state.metric, this.state.existingMetric);
              }}
              // disabled={! this.state.isValid}
              size="sm"
              variant="dark"
            >
              Save Metric
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
